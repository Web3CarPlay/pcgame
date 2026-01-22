package api

import (
	"pcgame/backend/internal/model"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AdminHandler handles admin user operations
type AdminHandler struct {
	db *gorm.DB
}

// NewAdminHandler creates a new admin handler
func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

// SetupAdminUserRoutes sets up admin user management routes
func SetupAdminUserRoutes(r *gin.RouterGroup, db *gorm.DB) {
	h := NewAdminHandler(db)

	// Public routes
	r.POST("/login", h.Login)

	// Protected routes (super_admin only for user management)
	admins := r.Group("/admins")
	admins.Use(AuthMiddleware(db))
	admins.Use(RequireRole(model.RoleSuperAdmin))
	{
		admins.GET("", h.List)
		admins.POST("", h.Create)
		admins.PUT("/:id", h.Update)
		admins.DELETE("/:id", h.Delete)
	}

	// Current admin info
	r.GET("/me", AuthMiddleware(db), h.GetCurrentAdmin)
}

// LoginRequest represents a login request
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login handles admin login
func (h *AdminHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var admin model.AdminUser
	if err := h.db.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password)); err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	if admin.Status != "active" {
		c.JSON(403, gin.H{"error": "Account disabled"})
		return
	}

	// TODO: Generate proper JWT token
	// For now, return admin ID as token
	c.JSON(200, gin.H{
		"token": admin.ID,
		"admin": gin.H{
			"id":       admin.ID,
			"username": admin.Username,
			"role":     admin.Role,
		},
	})
}

// GetCurrentAdmin returns current admin info
func (h *AdminHandler) GetCurrentAdmin(c *gin.Context) {
	admin, ok := GetAdminFromContext(c)
	if !ok {
		c.JSON(401, gin.H{"error": "Not authenticated"})
		return
	}

	c.JSON(200, gin.H{
		"id":       admin.ID,
		"username": admin.Username,
		"role":     admin.Role,
	})
}

// List returns all admins (super_admin only)
func (h *AdminHandler) List(c *gin.Context) {
	var admins []model.AdminUser
	h.db.Find(&admins)

	// Remove passwords
	result := make([]gin.H, len(admins))
	for i, a := range admins {
		result[i] = gin.H{
			"id":       a.ID,
			"username": a.Username,
			"role":     a.Role,
			"status":   a.Status,
		}
	}

	c.JSON(200, result)
}

// CreateAdminRequest represents a create admin request
type CreateAdminRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

// Create creates a new admin
func (h *AdminHandler) Create(c *gin.Context) {
	var req CreateAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Validate role
	if req.Role != model.RoleSuperAdmin && req.Role != model.RoleAdmin && req.Role != model.RoleOperator {
		c.JSON(400, gin.H{"error": "Invalid role"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	admin := model.AdminUser{
		Username: req.Username,
		Password: string(hashedPassword),
		Role:     req.Role,
		Status:   "active",
	}

	if err := h.db.Create(&admin).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create admin"})
		return
	}

	c.JSON(201, gin.H{
		"id":       admin.ID,
		"username": admin.Username,
		"role":     admin.Role,
	})
}

// Update updates an admin
func (h *AdminHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var admin model.AdminUser
	if err := h.db.First(&admin, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Admin not found"})
		return
	}

	var req struct {
		Role   string `json:"role"`
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if req.Role != "" {
		admin.Role = req.Role
	}
	if req.Status != "" {
		admin.Status = req.Status
	}

	h.db.Save(&admin)
	c.JSON(200, gin.H{
		"id":       admin.ID,
		"username": admin.Username,
		"role":     admin.Role,
		"status":   admin.Status,
	})
}

// Delete deletes an admin
func (h *AdminHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&model.AdminUser{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete admin"})
		return
	}
	c.JSON(204, nil)
}
