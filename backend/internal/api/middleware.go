package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pcgame/backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// JWT Secret (should be loaded from config in production)
var jwtSecret = []byte("pc28-game-secret-key-change-in-production")

// Token expiry duration
const tokenExpiry = 24 * time.Hour

// ==========================================
// JWT Token Generation & Validation
// ==========================================

type TokenClaims struct {
	ID       uint   `json:"id"`
	Type     string `json:"type"` // "admin" or "player"
	Role     string `json:"role,omitempty"`
	ExpireAt int64  `json:"exp"`
}

func generateToken(claims TokenClaims) string {
	claims.ExpireAt = time.Now().Add(tokenExpiry).Unix()

	// Create payload
	payload, _ := json.Marshal(claims)
	payloadB64 := base64.RawURLEncoding.EncodeToString(payload)

	// Create signature
	h := hmac.New(sha256.New, jwtSecret)
	h.Write([]byte(payloadB64))
	signature := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	return payloadB64 + "." + signature
}

func validateToken(token string) (*TokenClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid token format")
	}

	payloadB64 := parts[0]
	signature := parts[1]

	// Verify signature
	h := hmac.New(sha256.New, jwtSecret)
	h.Write([]byte(payloadB64))
	expectedSig := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	if !hmac.Equal([]byte(signature), []byte(expectedSig)) {
		return nil, fmt.Errorf("invalid signature")
	}

	// Decode payload
	payload, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return nil, fmt.Errorf("invalid payload encoding")
	}

	var claims TokenClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("invalid payload")
	}

	// Check expiry
	if claims.ExpireAt < time.Now().Unix() {
		return nil, fmt.Errorf("token expired")
	}

	return &claims, nil
}

// GenerateAdminToken generates a token for admin user
func GenerateAdminToken(admin *model.AdminUser) string {
	return generateToken(TokenClaims{
		ID:   admin.ID,
		Type: "admin",
		Role: admin.Role,
	})
}

// GeneratePlayerToken generates a token for player
func GeneratePlayerToken(user *model.User) string {
	return generateToken(TokenClaims{
		ID:   user.ID,
		Type: "player",
	})
}

// ==========================================
// Admin Authentication Middleware
// ==========================================

func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		claims, err := validateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
			c.Abort()
			return
		}

		if claims.Type != "admin" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type"})
			c.Abort()
			return
		}

		var admin model.AdminUser
		if err := db.First(&admin, claims.ID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin not found"})
			c.Abort()
			return
		}

		if admin.Status != "active" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Account disabled"})
			c.Abort()
			return
		}

		c.Set("admin_id", admin.ID)
		c.Set("admin_role", admin.Role)
		c.Set("admin", admin)
		c.Next()
	}
}

// ==========================================
// Player Authentication Middleware
// ==========================================

func PlayerAuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		claims, err := validateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
			c.Abort()
			return
		}

		if claims.Type != "player" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type"})
			c.Abort()
			return
		}

		var user model.User
		if err := db.First(&user, claims.ID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		c.Set("user_id", user.ID)
		c.Set("user", user)
		c.Next()
	}
}

// ==========================================
// Rate Limiting Middleware
// ==========================================

var rateLimitStore = make(map[string][]int64)

func RateLimitMiddleware(maxRequests int, windowSeconds int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now().Unix()

		// Clean old entries
		if timestamps, exists := rateLimitStore[ip]; exists {
			var valid []int64
			for _, t := range timestamps {
				if now-t < windowSeconds {
					valid = append(valid, t)
				}
			}
			rateLimitStore[ip] = valid
		}

		// Check limit
		if len(rateLimitStore[ip]) >= maxRequests {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}

		// Add current request
		rateLimitStore[ip] = append(rateLimitStore[ip], now)
		c.Next()
	}
}

// ==========================================
// Security Headers Middleware
// ==========================================

func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent XSS
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")

		// Content Security Policy
		c.Header("Content-Security-Policy", "default-src 'self'")

		// HSTS (only in production with HTTPS)
		// c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

		c.Next()
	}
}

// ==========================================
// CORS Middleware (Configurable)
// ==========================================

func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		// Check if origin is allowed
		allowed := false
		for _, o := range allowedOrigins {
			if o == "*" || o == origin {
				allowed = true
				break
			}
		}

		if allowed && origin != "" {
			c.Header("Access-Control-Allow-Origin", origin)
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
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

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		adminRole, exists := c.Get("admin_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			c.Abort()
			return
		}

		role := adminRole.(string)
		if role == model.RoleSuperAdmin {
			c.Next()
			return
		}

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

func GetAdminFromContext(c *gin.Context) (*model.AdminUser, bool) {
	admin, exists := c.Get("admin")
	if !exists {
		return nil, false
	}
	a := admin.(model.AdminUser)
	return &a, true
}

func GetUserFromContext(c *gin.Context) (*model.User, bool) {
	user, exists := c.Get("user")
	if !exists {
		return nil, false
	}
	u := user.(model.User)
	return &u, true
}

func GetUserIDFromContext(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	return userID.(uint), true
}

func IsSuperAdmin(c *gin.Context) bool {
	role, exists := c.Get("admin_role")
	if !exists {
		return false
	}
	return role.(string) == model.RoleSuperAdmin
}

// ==========================================
// Input Validation Helpers
// ==========================================

func ValidateID(idStr string) (uint, error) {
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || id == 0 {
		return 0, fmt.Errorf("invalid ID")
	}
	return uint(id), nil
}
