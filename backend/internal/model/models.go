package model

import (
	"time"

	"gorm.io/gorm"
)

// User represents a player in the system
type User struct {
	gorm.Model
	Username string  `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password string  `gorm:"size:255;not null" json:"-"`
	Balance  float64 `gorm:"default:0" json:"balance"`
	Role     string  `gorm:"size:20;default:'user'" json:"role"` // user, admin
}

// RoundStatus represents the status of a game round
type RoundStatus string

const (
	RoundStatusPending RoundStatus = "pending" // Waiting for bets
	RoundStatusOpen    RoundStatus = "open"    // Accepting bets
	RoundStatusClosed  RoundStatus = "closed"  // No more bets
	RoundStatusSettled RoundStatus = "settled" // Results calculated
	RoundStatusVoid    RoundStatus = "void"    // Voided round
)

// PC28Round represents a single game round
type PC28Round struct {
	gorm.Model
	IssueNumber string      `gorm:"uniqueIndex;size:50;not null" json:"issue_number"` // 期号
	KenoData    string      `gorm:"type:jsonb" json:"keno_data"`                      // JSON array of 20 numbers
	ResultA     int         `gorm:"default:0" json:"result_a"`                        // First digit (0-9)
	ResultB     int         `gorm:"default:0" json:"result_b"`                        // Second digit (0-9)
	ResultC     int         `gorm:"default:0" json:"result_c"`                        // Third digit (0-9)
	Sum         int         `gorm:"default:0" json:"sum"`                             // A + B + C (0-27)
	OpenTime    time.Time   `gorm:"not null" json:"open_time"`                        // When betting opens
	CloseTime   time.Time   `gorm:"not null" json:"close_time"`                       // When betting closes
	Status      RoundStatus `gorm:"size:20;default:'pending'" json:"status"`
}

// BetType represents the type of bet placed
type BetType string

const (
	BetTypeNumber    BetType = "number"     // Specific number 0-27
	BetTypeBig       BetType = "big"        // 14-27
	BetTypeSmall     BetType = "small"      // 0-13
	BetTypeOdd       BetType = "odd"        // Odd sum
	BetTypeEven      BetType = "even"       // Even sum
	BetTypeBigOdd    BetType = "big_odd"    // Big + Odd
	BetTypeBigEven   BetType = "big_even"   // Big + Even
	BetTypeSmallOdd  BetType = "small_odd"  // Small + Odd
	BetTypeSmallEven BetType = "small_even" // Small + Even
)

// BetStatus represents the status of a bet
type BetStatus string

const (
	BetStatusPending  BetStatus = "pending"  // Waiting for result
	BetStatusWon      BetStatus = "won"      // User won
	BetStatusLost     BetStatus = "lost"     // User lost
	BetStatusRefunded BetStatus = "refunded" // Bet refunded (void round)
)

// PC28Bet represents a bet placed by a user
type PC28Bet struct {
	gorm.Model
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	RoundID   uint      `gorm:"index;not null" json:"round_id"`
	Round     PC28Round `gorm:"foreignKey:RoundID" json:"-"`
	BetType   BetType   `gorm:"size:20;not null" json:"bet_type"`
	BetValue  int       `gorm:"default:0" json:"bet_value"` // For number bets, the specific number
	Amount    float64   `gorm:"not null" json:"amount"`
	Odds      float64   `gorm:"not null" json:"odds"`
	Status    BetStatus `gorm:"size:20;default:'pending'" json:"status"`
	WinAmount float64   `gorm:"default:0" json:"win_amount"`
}
