package api

import (
	"pcgame/backend/internal/model"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserHandler handles user-related requests
type UserHandler struct {
	db *gorm.DB
}

// NewUserHandler creates a new user handler
func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{db: db}
}

// SetupUserRoutes sets up user routes
func SetupUserRoutes(r *gin.RouterGroup, db *gorm.DB) {
	h := NewUserHandler(db)

	// Admin-only routes
	users := r.Group("/users")
	users.Use(AuthMiddleware(db))
	{
		users.GET("", h.List)
	}

	// Player routes (authenticated)
	player := r.Group("/player")
	player.Use(PlayerAuthMiddleware(db))
	{
		player.GET("/me", h.GetCurrentPlayer)
		player.GET("/invite-code", h.GetInviteCode)
		player.GET("/referrals", h.GetReferrals)
		player.GET("/referral-stats", h.GetReferralStats)
		player.GET("/earnings", h.GetEarnings)
	}
}

// List returns all users (admin only)
func (h *UserHandler) List(c *gin.Context) {
	var users []model.User

	adminRole, _ := c.Get("admin_role")
	adminID, _ := c.Get("admin_id")

	query := h.db.Preload("Operator").Preload("Referrer")

	switch adminRole.(string) {
	case model.RoleSuperAdmin:
		query.Find(&users)
	case model.RoleAdmin:
		var operatorIDs []uint
		h.db.Model(&model.Operator{}).Where("created_by_id = ?", adminID).Pluck("id", &operatorIDs)
		query.Where("operator_id IN ?", operatorIDs).Find(&users)
	case model.RoleOperator:
		users = []model.User{}
	default:
		c.JSON(403, gin.H{"error": "Access denied"})
		return
	}

	for i := range users {
		var count int64
		h.db.Model(&model.User{}).Where("referrer_id = ?", users[i].ID).Count(&count)
		users[i].InviteCount = int(count)
	}

	c.JSON(200, users)
}

// GetCurrentPlayer returns the current player info
func (h *UserHandler) GetCurrentPlayer(c *gin.Context) {
	user, ok := GetUserFromContext(c)
	if !ok {
		c.JSON(401, gin.H{"error": "Not authenticated"})
		return
	}

	c.JSON(200, gin.H{
		"id":          user.ID,
		"username":    user.Username,
		"balance":     user.Balance,
		"invite_code": user.InviteCode,
	})
}

// GetInviteCode returns the current user's invite code
func (h *UserHandler) GetInviteCode(c *gin.Context) {
	userID, ok := GetUserIDFromContext(c)
	if !ok {
		c.JSON(401, gin.H{"error": "Not authenticated"})
		return
	}

	var user model.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	baseURL := c.GetHeader("Origin")
	if baseURL == "" {
		baseURL = "http://localhost:5174"
	}

	c.JSON(200, gin.H{
		"invite_code": user.InviteCode,
		"invite_url":  baseURL + "?ref=" + user.InviteCode,
	})
}

// GetReferrals returns users invited by the current user with bet statistics
func (h *UserHandler) GetReferrals(c *gin.Context) {
	userID, ok := GetUserIDFromContext(c)
	if !ok {
		c.JSON(401, gin.H{"error": "Not authenticated"})
		return
	}

	var referrals []model.User
	h.db.Where("referrer_id = ?", userID).Find(&referrals)

	// Calculate bet statistics for each referral
	type ReferralWithStats struct {
		ID        uint    `json:"id"`
		Username  string  `json:"username"`
		TotalBet  float64 `json:"total_bet"`
		TotalWin  float64 `json:"total_win"`
		NetLoss   float64 `json:"net_loss"`
		CreatedAt string  `json:"created_at"`
	}

	result := make([]ReferralWithStats, 0, len(referrals))
	for _, r := range referrals {
		var totalBet, totalWin float64
		h.db.Model(&model.PC28Bet{}).Where("user_id = ?", r.ID).
			Select("COALESCE(SUM(amount), 0)").Scan(&totalBet)
		h.db.Model(&model.PC28Bet{}).Where("user_id = ? AND status = ?", r.ID, "won").
			Select("COALESCE(SUM(win_amount), 0)").Scan(&totalWin)

		result = append(result, ReferralWithStats{
			ID:        r.ID,
			Username:  r.Username,
			TotalBet:  totalBet,
			TotalWin:  totalWin,
			NetLoss:   totalBet - totalWin, // Customer loss = bet - win
			CreatedAt: r.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	c.JSON(200, result)
}

// GetReferralStats returns summary statistics for the user's referrals
func (h *UserHandler) GetReferralStats(c *gin.Context) {
	userID, ok := GetUserIDFromContext(c)
	if !ok {
		c.JSON(401, gin.H{"error": "Not authenticated"})
		return
	}

	// Get referral IDs
	var referralIDs []uint
	h.db.Model(&model.User{}).Where("referrer_id = ?", userID).Pluck("id", &referralIDs)

	totalReferrals := len(referralIDs)
	var activeReferrals int64
	var totalCustomerLoss float64
	commissionRate := 0.1 // Default 10%, can be configured later

	if totalReferrals > 0 {
		// Count active referrals (those who have placed bets)
		h.db.Model(&model.PC28Bet{}).Where("user_id IN ?", referralIDs).
			Distinct("user_id").Count(&activeReferrals)

		// Calculate total customer loss (total bet - total win)
		var totalBet, totalWin float64
		h.db.Model(&model.PC28Bet{}).Where("user_id IN ?", referralIDs).
			Select("COALESCE(SUM(amount), 0)").Scan(&totalBet)
		h.db.Model(&model.PC28Bet{}).Where("user_id IN ? AND status = ?", referralIDs, "won").
			Select("COALESCE(SUM(win_amount), 0)").Scan(&totalWin)
		totalCustomerLoss = totalBet - totalWin
	}

	totalCommission := totalCustomerLoss * commissionRate
	if totalCommission < 0 {
		totalCommission = 0 // No negative commission
	}

	c.JSON(200, gin.H{
		"total_referrals":     totalReferrals,
		"active_referrals":    activeReferrals,
		"total_customer_loss": totalCustomerLoss,
		"total_commission":    totalCommission,
		"commission_rate":     commissionRate,
	})
}

// GetEarnings returns daily earnings breakdown
func (h *UserHandler) GetEarnings(c *gin.Context) {
	userID, ok := GetUserIDFromContext(c)
	if !ok {
		c.JSON(401, gin.H{"error": "Not authenticated"})
		return
	}

	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	// Get referral IDs
	var referralIDs []uint
	h.db.Model(&model.User{}).Where("referrer_id = ?", userID).Pluck("id", &referralIDs)

	commissionRate := 0.1 // Default 10%
	var totalEarnings float64

	type DailyEarning struct {
		Date          string  `json:"date"`
		CustomerLoss  float64 `json:"customer_loss"`
		Commission    float64 `json:"commission"`
		ReferralCount int     `json:"referral_count"`
	}

	dailyEarnings := make([]DailyEarning, 0)

	if len(referralIDs) > 0 {
		// Get daily breakdown
		query := h.db.Model(&model.PC28Bet{}).
			Select("DATE(created_at) as bet_date, SUM(amount) as total_bet, "+
				"SUM(CASE WHEN status = 'won' THEN win_amount ELSE 0 END) as total_win, "+
				"COUNT(DISTINCT user_id) as user_count").
			Where("user_id IN ?", referralIDs).
			Group("DATE(created_at)").
			Order("bet_date DESC")

		if startDate != "" {
			query = query.Where("DATE(created_at) >= ?", startDate)
		}
		if endDate != "" {
			query = query.Where("DATE(created_at) <= ?", endDate)
		}

		type DailyResult struct {
			BetDate   string
			TotalBet  float64
			TotalWin  float64
			UserCount int
		}

		var results []DailyResult
		query.Scan(&results)

		for _, r := range results {
			loss := r.TotalBet - r.TotalWin
			commission := loss * commissionRate
			if commission < 0 {
				commission = 0
			}
			totalEarnings += commission

			dailyEarnings = append(dailyEarnings, DailyEarning{
				Date:          r.BetDate,
				CustomerLoss:  loss,
				Commission:    commission,
				ReferralCount: r.UserCount,
			})
		}
	}

	c.JSON(200, gin.H{
		"total_earnings":   totalEarnings,
		"pending_earnings": 0, // Placeholder for future implementation
		"settled_earnings": totalEarnings,
		"daily_earnings":   dailyEarnings,
	})
}

// ==========================================
// Player Auth Handlers
// ==========================================

type PlayerLoginRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6,max=100"`
}

// Login handles player login
func (h *UserHandler) Login(c *gin.Context) {
	var req PlayerLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	var user model.User
	if err := h.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token
	token := GeneratePlayerToken(&user)

	c.JSON(200, gin.H{
		"token": token,
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"balance":     user.Balance,
			"invite_code": user.InviteCode,
		},
	})
}

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Username     string `json:"username" binding:"required,min=3,max=50,alphanum"`
	Password     string `json:"password" binding:"required,min=6,max=100"`
	OperatorCode string `json:"operator_code" binding:"omitempty,max=20"`
	ReferrerCode string `json:"referrer_code" binding:"omitempty,max=20"`
}

// Register handles user registration
func (h *UserHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Check if username exists
	var existing model.User
	if err := h.db.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		c.JSON(400, gin.H{"error": "Username already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to process request"})
		return
	}

	user := model.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Balance:  1000,
	}

	if req.ReferrerCode != "" {
		var referrer model.User
		if err := h.db.Where("invite_code = ?", req.ReferrerCode).First(&referrer).Error; err == nil {
			user.ReferrerID = &referrer.ID
			if referrer.OperatorID != nil {
				user.OperatorID = referrer.OperatorID
			}
		}
	}

	if user.OperatorID == nil && req.OperatorCode != "" {
		var operator model.Operator
		if err := h.db.Where("code = ?", req.OperatorCode).First(&operator).Error; err == nil {
			user.OperatorID = &operator.ID
		}
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	token := GeneratePlayerToken(&user)

	c.JSON(201, gin.H{
		"token": token,
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"balance":     user.Balance,
			"invite_code": user.InviteCode,
		},
	})
}
