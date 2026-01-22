package tasks

import (
	"fmt"
	"time"

	"pcgame/backend/internal/model"
	"pcgame/backend/internal/service"
	"pcgame/backend/internal/websocket"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Scheduler handles scheduled tasks for the game
type Scheduler struct {
	db      *gorm.DB
	hub     *websocket.Hub
	logger  *zap.SugaredLogger
	cron    *cron.Cron
	gameSvc *service.GameService
}

// NewScheduler creates a new scheduler
func NewScheduler(db *gorm.DB, hub *websocket.Hub, logger *zap.SugaredLogger) *Scheduler {
	return &Scheduler{
		db:      db,
		hub:     hub,
		logger:  logger,
		cron:    cron.New(cron.WithSeconds()),
		gameSvc: service.NewGameService(),
	}
}

// Start starts the scheduler
func (s *Scheduler) Start() {
	// Run every minute at :00 seconds - create new round and settle previous
	s.cron.AddFunc("0 * * * * *", s.processRounds)

	// Countdown every second
	s.cron.AddFunc("* * * * * *", s.broadcastCountdown)

	s.cron.Start()
	s.logger.Info("Scheduler started")
}

// Stop stops the scheduler
func (s *Scheduler) Stop() {
	s.cron.Stop()
	s.logger.Info("Scheduler stopped")
}

// processRounds handles round lifecycle
func (s *Scheduler) processRounds() {
	now := time.Now()

	// 1. Settle any closed rounds that haven't been settled
	s.settleClosedRounds()

	// 2. Close the current open round
	s.closeOpenRounds()

	// 3. Create a new round
	s.createNewRound(now)
}

// createNewRound creates a new betting round
func (s *Scheduler) createNewRound(now time.Time) {
	issueNumber := now.Format("20060102150405")

	round := model.PC28Round{
		IssueNumber: issueNumber,
		OpenTime:    now,
		CloseTime:   now.Add(55 * time.Second), // 55 seconds betting window
		Status:      model.RoundStatusOpen,
	}

	if err := s.db.Create(&round).Error; err != nil {
		s.logger.Errorf("Failed to create round: %v", err)
		return
	}

	s.logger.Infof("Created new round: %s", issueNumber)

	// Broadcast new round
	s.hub.BroadcastRoundUpdate(map[string]interface{}{
		"round_id":     round.ID,
		"issue_number": round.IssueNumber,
		"open_time":    round.OpenTime,
		"close_time":   round.CloseTime,
		"status":       round.Status,
	})
}

// closeOpenRounds closes any open rounds that have passed their close time
func (s *Scheduler) closeOpenRounds() {
	now := time.Now()

	var rounds []model.PC28Round
	s.db.Where("status = ? AND close_time <= ?", model.RoundStatusOpen, now).Find(&rounds)

	for _, round := range rounds {
		// Generate mock Keno data
		kenoData := s.gameSvc.GenerateMockKenoData()
		result := s.gameSvc.CalculateResult(kenoData)

		round.KenoData = s.gameSvc.KenoDataToJSON(kenoData)
		round.ResultA = result.A
		round.ResultB = result.B
		round.ResultC = result.C
		round.Sum = result.Sum
		round.Status = model.RoundStatusClosed

		if err := s.db.Save(&round).Error; err != nil {
			s.logger.Errorf("Failed to close round %s: %v", round.IssueNumber, err)
			continue
		}

		s.logger.Infof("Closed round %s with result: %d", round.IssueNumber, result.Sum)

		// Broadcast result
		s.hub.BroadcastResult(map[string]interface{}{
			"round_id":     round.ID,
			"issue_number": round.IssueNumber,
			"keno_data":    kenoData,
			"result_a":     result.A,
			"result_b":     result.B,
			"result_c":     result.C,
			"sum":          result.Sum,
		})
	}
}

// settleClosedRounds settles bets for closed rounds
func (s *Scheduler) settleClosedRounds() {
	var rounds []model.PC28Round
	s.db.Where("status = ?", model.RoundStatusClosed).Find(&rounds)

	for _, round := range rounds {
		s.settleRound(&round)
	}
}

// settleRound settles all bets for a specific round
func (s *Scheduler) settleRound(round *model.PC28Round) {
	result := service.PC28Result{
		A:   round.ResultA,
		B:   round.ResultB,
		C:   round.ResultC,
		Sum: round.Sum,
	}

	var bets []model.PC28Bet
	s.db.Where("round_id = ? AND status = ?", round.ID, model.BetStatusPending).Find(&bets)

	for _, bet := range bets {
		// Start transaction
		tx := s.db.Begin()

		won := s.gameSvc.CheckWin(string(bet.BetType), bet.BetValue, result)

		if won {
			winAmount := bet.Amount * bet.Odds
			bet.WinAmount = winAmount
			bet.Status = model.BetStatusWon

			// Update user balance
			if err := tx.Model(&model.User{}).Where("id = ?", bet.UserID).
				Update("balance", gorm.Expr("balance + ?", winAmount)).Error; err != nil {
				tx.Rollback()
				s.logger.Errorf("Failed to update user balance: %v", err)
				continue
			}
		} else {
			bet.Status = model.BetStatusLost
		}

		if err := tx.Save(&bet).Error; err != nil {
			tx.Rollback()
			s.logger.Errorf("Failed to update bet: %v", err)
			continue
		}

		tx.Commit()
	}

	// Mark round as settled
	round.Status = model.RoundStatusSettled
	s.db.Save(round)

	s.logger.Infof("Settled round %s", round.IssueNumber)
}

// broadcastCountdown broadcasts the current countdown
func (s *Scheduler) broadcastCountdown() {
	var round model.PC28Round
	if err := s.db.Where("status = ?", model.RoundStatusOpen).Order("id desc").First(&round).Error; err != nil {
		return
	}

	remaining := int(time.Until(round.CloseTime).Seconds())
	if remaining < 0 {
		remaining = 0
	}

	s.hub.BroadcastCountdown(remaining)
}

// generateIssueNumber generates a unique issue number based on time
func generateIssueNumber(t time.Time) string {
	return fmt.Sprintf("%s%03d", t.Format("20060102"), getDailySequence(t))
}

// getDailySequence returns the sequence number for the day
func getDailySequence(t time.Time) int {
	// Each round is 1 minute, so max 1440 rounds per day
	return t.Hour()*60 + t.Minute()
}
