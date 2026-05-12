package conf

import (
	"fmt"
	"sync"
)

const maxRecords = 1000

type stat struct {
	mu      sync.RWMutex
	records []bool
	index   int // current position
	total   int // total records
	succ    int // successful records
}

var (
	data sync.Map // map[string]*stat
)

func getStat(net string) *stat {
	val, _ := data.LoadOrStore(net, &stat{
		records: make([]bool, maxRecords),
	})
	return val.(*stat)
}

func RecordSuccess(net string) {
	s := getStat(net)
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.total >= maxRecords && !s.records[s.index] {
		s.succ++
	} else if s.total < maxRecords {
		s.succ++
	}

	s.records[s.index] = true
	s.index = (s.index + 1) % maxRecords
	if s.total < maxRecords {
		s.total++
	}
}

func RecordFailure(net string) {
	s := getStat(net)
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.total >= maxRecords && s.records[s.index] {
		s.succ--
	}

	s.records[s.index] = false
	s.index = (s.index + 1) % maxRecords
	if s.total < maxRecords {
		s.total++
	}
}

func GetSuccessRate(net string) string {
	s := getStat(net)
	s.mu.RLock()
	defer s.mu.RUnlock()

	if s.total == 0 {
		return "100.00%"
	}

	return fmt.Sprintf("%.2f%%", float64(s.succ)/float64(s.total)*100)
}
