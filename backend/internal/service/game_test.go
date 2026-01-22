package service

import (
	"testing"
)

func TestCalculateResult(t *testing.T) {
	gs := NewGameService()

	tests := []struct {
		name     string
		kenoData []int
		wantA    int
		wantB    int
		wantC    int
		wantSum  int
	}{
		{
			name:     "Standard case",
			kenoData: []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20},
			// Sorted: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
			// A = (1+2+3+4+5+6) % 10 = 21 % 10 = 1
			// B = (7+8+9+10+11+12) % 10 = 57 % 10 = 7
			// C = (13+14+15+16+17+18) % 10 = 93 % 10 = 3
			// Sum = 1 + 7 + 3 = 11
			wantA:   1,
			wantB:   7,
			wantC:   3,
			wantSum: 11,
		},
		{
			name:     "Unsorted input",
			kenoData: []int{20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1},
			// Same as above after sorting
			wantA:   1,
			wantB:   7,
			wantC:   3,
			wantSum: 11,
		},
		{
			name:     "High numbers",
			kenoData: []int{61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80},
			// A = (61+62+63+64+65+66) % 10 = 381 % 10 = 1
			// B = (67+68+69+70+71+72) % 10 = 417 % 10 = 7
			// C = (73+74+75+76+77+78) % 10 = 453 % 10 = 3
			// Sum = 1 + 7 + 3 = 11
			wantA:   1,
			wantB:   7,
			wantC:   3,
			wantSum: 11,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := gs.CalculateResult(tt.kenoData)
			if result.A != tt.wantA {
				t.Errorf("A = %d, want %d", result.A, tt.wantA)
			}
			if result.B != tt.wantB {
				t.Errorf("B = %d, want %d", result.B, tt.wantB)
			}
			if result.C != tt.wantC {
				t.Errorf("C = %d, want %d", result.C, tt.wantC)
			}
			if result.Sum != tt.wantSum {
				t.Errorf("Sum = %d, want %d", result.Sum, tt.wantSum)
			}
		})
	}
}

func TestCheckWin(t *testing.T) {
	gs := NewGameService()

	tests := []struct {
		name     string
		betType  string
		betValue int
		result   PC28Result
		want     bool
	}{
		{"number win", "number", 15, PC28Result{Sum: 15}, true},
		{"number lose", "number", 15, PC28Result{Sum: 14}, false},
		{"big win", "big", 0, PC28Result{Sum: 20}, true},
		{"big lose", "big", 0, PC28Result{Sum: 10}, false},
		{"small win", "small", 0, PC28Result{Sum: 5}, true},
		{"small lose", "small", 0, PC28Result{Sum: 15}, false},
		{"odd win", "odd", 0, PC28Result{Sum: 15}, true},
		{"odd lose", "odd", 0, PC28Result{Sum: 14}, false},
		{"even win", "even", 0, PC28Result{Sum: 14}, true},
		{"even lose", "even", 0, PC28Result{Sum: 15}, false},
		{"big_odd win", "big_odd", 0, PC28Result{Sum: 17}, true},
		{"big_odd lose - small", "big_odd", 0, PC28Result{Sum: 7}, false},
		{"big_odd lose - even", "big_odd", 0, PC28Result{Sum: 16}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := gs.CheckWin(tt.betType, tt.betValue, tt.result)
			if got != tt.want {
				t.Errorf("CheckWin() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestGenerateMockKenoData(t *testing.T) {
	gs := NewGameService()
	data := gs.GenerateMockKenoData()

	if len(data) != 20 {
		t.Errorf("Expected 20 numbers, got %d", len(data))
	}

	// Check all numbers are unique and in range 1-80
	seen := make(map[int]bool)
	for _, n := range data {
		if n < 1 || n > 80 {
			t.Errorf("Number %d out of range 1-80", n)
		}
		if seen[n] {
			t.Errorf("Duplicate number %d", n)
		}
		seen[n] = true
	}
}
