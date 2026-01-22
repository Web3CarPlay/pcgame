package api

import (
	"net/http"
	"strconv"
	"strings"

	"pcgame/backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ==========================================
// Admin Authentication Middleware
// ==========================================

// AuthMiddleware checks for valid admin authentication
func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// Token format: admin_<id> for now
		// TODO: Implement proper JWT validation
		var admin model.AdminUser
		adminID, err := strconv.ParseUint(token, 10, 64)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if err := db.First(&admin, adminID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if admin.Status != "active" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Account disabled"})
			c.Abort()
			return
		}

		// Set admin info in context
		c.Set("admin_id", admin.ID)
		c.Set("admin_role", admin.Role)
		c.Set("admin", admin)

		c.Next()
	}
}

// ==========================================
// Player Authentication Middleware
// ==========================================

// PlayerAuthMiddleware checks for valid player authentication
func PlayerAuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// Token format: player_<id> for now
		// TODO: Implement proper JWT validation
		var user model.User
		userID, err := strconv.ParseUint(token, 10, 64)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", user.ID)
		c.Set("user", user)

		c.Next()
	}
}

// ==========================================
// Helper Functions
// ==========================================

func extractToken(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return ""
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}

	return parts[1]
}

// RequireRole middleware checks if admin has required role
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		adminRole, exists := c.Get("admin_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			c.Abort()
			return
		}

		role := adminRole.(string)

		// Super admin can access everything
		if role == model.RoleSuperAdmin {
			c.Next()
			return
		}

		// Check if role is allowed
		for _, r := range roles {
			if role == r {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		c.Abort()
	}
}

// GetAdminFromContext returns the current admin from context
func GetAdminFromContext(c *gin.Context) (*model.AdminUser, bool) {
	admin, exists := c.Get("admin")
	if !exists {
		return nil, false
	}
	a := admin.(model.AdminUser)
	return &a, true
}

// GetUserFromContext returns the current user from context
func GetUserFromContext(c *gin.Context) (*model.User, bool) {
	user, exists := c.Get("user")
	if !exists {
		return nil, false
	}
	u := user.(model.User)
	return &u, true
}

// GetUserIDFromContext returns the current user ID from context
func GetUserIDFromContext(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	return userID.(uint), true
}

// IsSuperAdmin checks if current admin is super admin
func IsSuperAdmin(c *gin.Context) bool {
	role, exists := c.Get("admin_role")
	if !exists {
		return false
	}
	return role.(string) == model.RoleSuperAdmin
}
