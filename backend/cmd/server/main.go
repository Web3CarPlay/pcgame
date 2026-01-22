package main

import (
	"log"
	"pcgame/backend/internal/api"
	"pcgame/backend/internal/config"
	"pcgame/backend/internal/model"
	"pcgame/backend/internal/tasks"
	"pcgame/backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// Initialize logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	sugar := logger.Sugar()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	db, err := model.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto migrate
	if err := model.AutoMigrate(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize Gin router
	r := gin.Default()

	// Setup routes
	api.SetupRoutes(r, db, hub, sugar)

	// Start scheduler
	scheduler := tasks.NewScheduler(db, hub, sugar)
	scheduler.Start()
	defer scheduler.Stop()

	sugar.Info("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
