package api

import (
	"pcgame/backend/internal/model"

	"github.com/gin-gonic/gin"
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

	users := r.Group("/users")
	{
		users.GET("", AuthMiddleware(db), h.List)
		users.GET("/invite-code", h.GetInviteCode)
		users.GET("/referrals", h.GetReferrals)
	}
}

// List returns all users with operator and referrer info (admin only)
func (h *UserHandler) List(c *gin.Context) {
	var users []model.User

	adminRole, _ := c.Get("admin_role")
	adminID, _ := c.Get("admin_id")

	query := h.db.Preload("Operator").Preload("Referrer")

	// Filter based on role
	switch adminRole.(string) {
	case model.RoleSuperAdmin:
		// See all users
		query.Find(&users)
	case model.RoleAdmin:
		// See users belonging to operators created by this admin
		var operatorIDs []uint
		h.db.Model(&model.Operator{}).Where("created_by_id = ?", adminID).Pluck("id", &operatorIDs)
		query.Where("operator_id IN ?", operatorIDs).Find(&users)
	case model.RoleOperator:
		// TODO: Operator role can only see users in their operator
		// For now, return empty
		users = []model.User{}
	default:
		c.JSON(403, gin.H{"error": "Access denied"})
		return
	}

	// Calculate invite count for each user
	for i := range users {
		var count int64
		h.db.Model(&model.User{}).Where("referrer_id = ?", users[i].ID).Count(&count)
		users[i].InviteCount = int(count)
	}

	c.JSON(200, users)
}

// GetInviteCode returns the current user's invite code
func (h *UserHandler) GetInviteCode(c *gin.Context) {
	// TODO: Get user from JWT token
	userID := uint(1) // Placeholder

	var user model.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	// Generate invite URL
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
	// TODO: Get user from JWT token
	userID := uint(1) // Placeholder

	var referrals []model.User
	h.db.Where("referrer_id = ?", userID).Find(&referrals)

	c.JSON(200, referrals)
}

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Username     string `json:"username" binding:"required"`
	Password     string `json:"password" binding:"required"`
	OperatorCode string `json:"operator_code"` // ?op=xxx
	ReferrerCode string `json:"referrer_code"` // ?ref=xxx
}

// Register handles user registration with operator/referrer attribution
func (h *UserHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	user := model.User{
		Username: req.Username,
		Password: req.Password, // TODO: Hash password
		Balance:  1000,         // Initial balance for testing
	}

	// Handle referrer code
	if req.ReferrerCode != "" {
		var referrer model.User
		if err := h.db.Where("invite_code = ?", req.ReferrerCode).First(&referrer).Error; err == nil {
			user.ReferrerID = &referrer.ID
			// Inherit operator from referrer
			if referrer.OperatorID != nil {
				user.OperatorID = referrer.OperatorID
			}
		}
	}

	// Handle operator code (only if not already set from referrer)
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

	c.JSON(201, gin.H{
		"id":          user.ID,
		"username":    user.Username,
		"invite_code": user.InviteCode,
		"operator_id": user.OperatorID,
		"referrer_id": user.ReferrerID,
	})
}
