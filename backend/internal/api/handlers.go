package api

import (
	"net/http"

	"pcgame/backend/internal/model"
	"pcgame/backend/internal/service"
	ws "pcgame/backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// Handler holds dependencies for API handlers
type Handler struct {
	db      *gorm.DB
	hub     *ws.Hub
	logger  *zap.SugaredLogger
	gameSvc *service.GameService
}

// NewHandler creates a new handler
func NewHandler(db *gorm.DB, hub *ws.Hub, logger *zap.SugaredLogger) *Handler {
	return &Handler{
		db:      db,
		hub:     hub,
		logger:  logger,
		gameSvc: service.NewGameService(),
	}
}

// SetupRoutes sets up all API routes
func SetupRoutes(r *gin.Engine, db *gorm.DB, hub *ws.Hub, logger *zap.SugaredLogger) {
	h := NewHandler(db, hub, logger)
	userHandler := NewUserHandler(db)

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1
	v1 := r.Group("/api/v1")
	{
		// Game routes
		games := v1.Group("/games/pc28")
		{
			games.GET("/round/current", h.GetCurrentRound)
			games.GET("/history", h.GetHistory)
			games.GET("/odds", h.GetOdds)
		}

		// Bet routes
		v1.POST("/bets", h.PlaceBet)
		v1.GET("/bets", h.GetUserBets)

		// Auth routes
		v1.POST("/auth/register", userHandler.Register)

		// User routes
		SetupUserRoutes(v1, db)

		// Admin routes
		admin := v1.Group("/admin")
		{
			SetupOperatorRoutes(admin, db)
		}
	}

	// WebSocket
	r.GET("/ws", h.HandleWebSocket)
}

// GetCurrentRound returns the current open round
func (h *Handler) GetCurrentRound(c *gin.Context) {
	var round model.PC28Round
	if err := h.db.Where("status = ?", model.RoundStatusOpen).Order("id desc").First(&round).Error; err != nil {
		c.JSON(404, gin.H{"error": "No open round"})
		return
	}

	c.JSON(200, round)
}

// GetHistory returns recent game history
func (h *Handler) GetHistory(c *gin.Context) {
	var rounds []model.PC28Round
	h.db.Where("status = ?", model.RoundStatusSettled).
		Order("id desc").
		Limit(20).
		Find(&rounds)

	c.JSON(200, rounds)
}

// GetOdds returns the current odds
func (h *Handler) GetOdds(c *gin.Context) {
	c.JSON(200, h.gameSvc.GetOdds())
}

// PlaceBetRequest represents a bet placement request
type PlaceBetRequest struct {
	RoundID  uint    `json:"round_id" binding:"required"`
	BetType  string  `json:"bet_type" binding:"required"`
	BetValue int     `json:"bet_value"`
	Amount   float64 `json:"amount" binding:"required,gt=0"`
}

// PlaceBet places a new bet
func (h *Handler) PlaceBet(c *gin.Context) {
	var req PlaceBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// TODO: Get user from JWT token
	userID := uint(1) // Placeholder

	// Verify round is open
	var round model.PC28Round
	if err := h.db.First(&round, req.RoundID).Error; err != nil {
		c.JSON(404, gin.H{"error": "Round not found"})
		return
	}

	if round.Status != model.RoundStatusOpen {
		c.JSON(400, gin.H{"error": "Round is not accepting bets"})
		return
	}

	// Get odds
	odds := h.gameSvc.GetOdds()[req.BetType]
	if odds == 0 {
		c.JSON(400, gin.H{"error": "Invalid bet type"})
		return
	}

	// Start transaction
	tx := h.db.Begin()

	// Check and deduct user balance
	var user model.User
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback()
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	if user.Balance < req.Amount {
		tx.Rollback()
		c.JSON(400, gin.H{"error": "Insufficient balance"})
		return
	}

	// Deduct balance
	if err := tx.Model(&user).Update("balance", gorm.Expr("balance - ?", req.Amount)).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to deduct balance"})
		return
	}

	// Create bet
	bet := model.PC28Bet{
		UserID:   userID,
		RoundID:  req.RoundID,
		BetType:  model.BetType(req.BetType),
		BetValue: req.BetValue,
		Amount:   req.Amount,
		Odds:     odds,
		Status:   model.BetStatusPending,
	}

	if err := tx.Create(&bet).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to create bet"})
		return
	}

	tx.Commit()

	c.JSON(201, bet)
}

// GetUserBets returns user's bet history
func (h *Handler) GetUserBets(c *gin.Context) {
	// TODO: Get user from JWT token
	userID := uint(1) // Placeholder

	var bets []model.PC28Bet
	h.db.Where("user_id = ?", userID).
		Preload("Round").
		Order("id desc").
		Limit(50).
		Find(&bets)

	c.JSON(200, bets)
}

// HandleWebSocket handles WebSocket connections
func (h *Handler) HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		h.logger.Errorf("WebSocket upgrade failed: %v", err)
		return
	}

	// TODO: Get user from query params or token
	userID := uint(0)

	client := ws.NewClient(h.hub, conn, userID)
	h.hub.Register(client)

	go client.WritePump()
	go client.ReadPump()
}
