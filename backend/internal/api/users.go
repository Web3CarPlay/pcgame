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

// GetReferrals returns users invited by the current user
func (h *UserHandler) GetReferrals(c *gin.Context) {
	userID, ok := GetUserIDFromContext(c)
	if !ok {
		c.JSON(401, gin.H{"error": "Not authenticated"})
		return
	}

	var referrals []model.User
	h.db.Where("referrer_id = ?", userID).Find(&referrals)
	c.JSON(200, referrals)
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
