package api

import (
	"pcgame/backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// OperatorHandler handles operator-related requests
type OperatorHandler struct {
	db *gorm.DB
}

// NewOperatorHandler creates a new operator handler
func NewOperatorHandler(db *gorm.DB) *OperatorHandler {
	return &OperatorHandler{db: db}
}

// SetupOperatorRoutes sets up operator routes
func SetupOperatorRoutes(r *gin.RouterGroup, db *gorm.DB) {
	h := NewOperatorHandler(db)

	ops := r.Group("/operators")
	{
		ops.GET("", h.List)
		ops.POST("", h.Create)
		ops.GET("/:id", h.Get)
		ops.PUT("/:id", h.Update)
		ops.DELETE("/:id", h.Delete)
		ops.GET("/:id/users", h.GetUsers)
	}
}

// List returns all operators
func (h *OperatorHandler) List(c *gin.Context) {
	var operators []model.Operator
	h.db.Find(&operators)

	// Calculate user count for each operator
	for i := range operators {
		var count int64
		h.db.Model(&model.User{}).Where("operator_id = ?", operators[i].ID).Count(&count)
		operators[i].UserCount = int(count)
	}

	c.JSON(200, operators)
}

// CreateOperatorRequest represents a create operator request
type CreateOperatorRequest struct {
	Code       string  `json:"code" binding:"required"`
	Name       string  `json:"name" binding:"required"`
	Commission float64 `json:"commission"`
}

// Create creates a new operator
func (h *OperatorHandler) Create(c *gin.Context) {
	var req CreateOperatorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	operator := model.Operator{
		Code:       req.Code,
		Name:       req.Name,
		Commission: req.Commission,
		Status:     "active",
	}

	if err := h.db.Create(&operator).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create operator"})
		return
	}

	c.JSON(201, operator)
}

// Get returns a single operator
func (h *OperatorHandler) Get(c *gin.Context) {
	id := c.Param("id")
	var operator model.Operator

	if err := h.db.First(&operator, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Operator not found"})
		return
	}

	// Calculate user count
	var count int64
	h.db.Model(&model.User{}).Where("operator_id = ?", operator.ID).Count(&count)
	operator.UserCount = int(count)

	c.JSON(200, operator)
}

// Update updates an operator
func (h *OperatorHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var operator model.Operator

	if err := h.db.First(&operator, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Operator not found"})
		return
	}

	var req CreateOperatorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	operator.Code = req.Code
	operator.Name = req.Name
	operator.Commission = req.Commission

	h.db.Save(&operator)
	c.JSON(200, operator)
}

// Delete deletes an operator
func (h *OperatorHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&model.Operator{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete operator"})
		return
	}
	c.JSON(204, nil)
}

// GetUsers returns users belonging to an operator
func (h *OperatorHandler) GetUsers(c *gin.Context) {
	id := c.Param("id")
	var users []model.User

	h.db.Where("operator_id = ?", id).
		Preload("Referrer").
		Find(&users)

	// Calculate invite count for each user
	for i := range users {
		var count int64
		h.db.Model(&model.User{}).Where("referrer_id = ?", users[i].ID).Count(&count)
		users[i].InviteCount = int(count)
	}

	c.JSON(200, users)
}
