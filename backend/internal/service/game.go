package service

import (
	"encoding/json"
	"math/rand"
	"sort"
	"time"
)

// GameService handles PC28 game logic
type GameService struct{}

func NewGameService() *GameService {
	return &GameService{}
}

// PC28Result holds the calculated result
type PC28Result struct {
	A   int `json:"a"`
	B   int `json:"b"`
	C   int `json:"c"`
	Sum int `json:"sum"`
}

// CalculateResult calculates PC28 result from Keno data
// Algorithm:
// 1. Sort the 20 numbers in ascending order
// 2. A = Sum(index 0-5) % 10
// 3. B = Sum(index 6-11) % 10
// 4. C = Sum(index 12-17) % 10
// 5. Sum = A + B + C (0-27)
func (s *GameService) CalculateResult(kenoData []int) PC28Result {
	if len(kenoData) < 18 {
		return PC28Result{}
	}

	// Sort the numbers
	sorted := make([]int, len(kenoData))
	copy(sorted, kenoData)
	sort.Ints(sorted)

	// Calculate A (sum of index 0-5, mod 10)
	sumA := 0
	for i := 0; i < 6; i++ {
		sumA += sorted[i]
	}
	a := sumA % 10

	// Calculate B (sum of index 6-11, mod 10)
	sumB := 0
	for i := 6; i < 12; i++ {
		sumB += sorted[i]
	}
	b := sumB % 10

	// Calculate C (sum of index 12-17, mod 10)
	sumC := 0
	for i := 12; i < 18; i++ {
		sumC += sorted[i]
	}
	c := sumC % 10

	return PC28Result{
		A:   a,
		B:   b,
		C:   c,
		Sum: a + b + c,
	}
}

// GenerateMockKenoData generates 20 unique random numbers between 1-80
func (s *GameService) GenerateMockKenoData() []int {
	rand.Seed(time.Now().UnixNano())

	// Create slice of all possible numbers
	numbers := make([]int, 80)
	for i := 0; i < 80; i++ {
		numbers[i] = i + 1
	}

	// Shuffle and take first 20
	rand.Shuffle(len(numbers), func(i, j int) {
		numbers[i], numbers[j] = numbers[j], numbers[i]
	})

	return numbers[:20]
}

// KenoDataToJSON converts keno data to JSON string
func (s *GameService) KenoDataToJSON(data []int) string {
	bytes, _ := json.Marshal(data)
	return string(bytes)
}

// JSONToKenoData parses JSON string to keno data
func (s *GameService) JSONToKenoData(jsonStr string) []int {
	var data []int
	json.Unmarshal([]byte(jsonStr), &data)
	return data
}

// GetOdds returns the payout odds for each bet type
func (s *GameService) GetOdds() map[string]float64 {
	return map[string]float64{
		"number":     9.8,  // Specific number (0-27), varies by number
		"big":        1.95, // 14-27
		"small":      1.95, // 0-13
		"odd":        1.95, // Odd sum
		"even":       1.95, // Even sum
		"big_odd":    3.7,  // Big + Odd
		"big_even":   3.7,  // Big + Even
		"small_odd":  3.7,  // Small + Odd
		"small_even": 3.7,  // Small + Even
	}
}

// CheckWin determines if a bet wins based on the result
func (s *GameService) CheckWin(betType string, betValue int, result PC28Result) bool {
	sum := result.Sum

	switch betType {
	case "number":
		return betValue == sum
	case "big":
		return sum >= 14 && sum <= 27
	case "small":
		return sum >= 0 && sum <= 13
	case "odd":
		return sum%2 == 1
	case "even":
		return sum%2 == 0
	case "big_odd":
		return sum >= 14 && sum%2 == 1
	case "big_even":
		return sum >= 14 && sum%2 == 0
	case "small_odd":
		return sum <= 13 && sum%2 == 1
	case "small_even":
		return sum <= 13 && sum%2 == 0
	default:
		return false
	}
}
