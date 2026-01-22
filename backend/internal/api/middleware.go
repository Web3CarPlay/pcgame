package api

import (
	"net/http"
	"strings"

	"pcgame/backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AuthMiddleware checks for valid admin authentication
func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// Extract token (Bearer <token>)
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		token := parts[1]

		// TODO: Implement proper JWT validation
		// For now, use simple token = admin_id mapping for development
		var admin model.AdminUser
		if err := db.Where("id = ?", token).First(&admin).Error; err != nil {
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

// IsSuperAdmin checks if current admin is super admin
func IsSuperAdmin(c *gin.Context) bool {
	role, exists := c.Get("admin_role")
	if !exists {
		return false
	}
	return role.(string) == model.RoleSuperAdmin
}
