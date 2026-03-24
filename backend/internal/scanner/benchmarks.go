package scanner

import (
	"context"
	"sort"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// BenchmarkData holds precomputed aggregate statistics across all scans.
type BenchmarkData struct {
	TotalStoresScanned int       `json:"totalStoresScanned"`
	Percentiles        []int     `json:"percentiles"` // scores at p10, p25, p50, p75, p90
	AverageScore       int       `json:"averageScore"`
	MedianScore        int       `json:"medianScore"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// BenchmarkResult is what gets attached to individual scan results.
type BenchmarkResult struct {
	Percentile         int `json:"percentile"`         // 0-100, higher = better than more stores
	TotalStoresScanned int `json:"totalStoresScanned"` // how many unique stores in the dataset
	AverageScore       int `json:"averageScore"`       // ecosystem average
}

// BenchmarkService caches aggregate scan statistics and computes percentile rankings.
type BenchmarkService struct {
	col       *mongo.Collection
	mu        sync.RWMutex
	data      *BenchmarkData
	scores    []int // sorted scores for percentile lookup
	cacheTTL  time.Duration
}

// NewBenchmarkService creates a benchmark service backed by the scans collection.
func NewBenchmarkService(col *mongo.Collection) *BenchmarkService {
	return &BenchmarkService{
		col:      col,
		cacheTTL: 15 * time.Minute,
	}
}

// GetBenchmark returns the percentile ranking for a given score.
func (b *BenchmarkService) GetBenchmark(ctx context.Context, score int) (*BenchmarkResult, error) {
	b.mu.RLock()
	stale := b.data == nil || time.Since(b.data.UpdatedAt) > b.cacheTTL
	b.mu.RUnlock()

	if stale {
		if err := b.refresh(ctx); err != nil {
			return nil, err
		}
	}

	b.mu.RLock()
	defer b.mu.RUnlock()

	if b.data == nil || b.data.TotalStoresScanned < 10 {
		return nil, nil // not enough data to benchmark
	}

	percentile := computePercentile(b.scores, score)

	return &BenchmarkResult{
		Percentile:         percentile,
		TotalStoresScanned: b.data.TotalStoresScanned,
		AverageScore:       b.data.AverageScore,
	}, nil
}

// GetAggregateData returns the full benchmark dataset (for the ecosystem report).
func (b *BenchmarkService) GetAggregateData(ctx context.Context) (*BenchmarkData, error) {
	b.mu.RLock()
	stale := b.data == nil || time.Since(b.data.UpdatedAt) > b.cacheTTL
	b.mu.RUnlock()

	if stale {
		if err := b.refresh(ctx); err != nil {
			return nil, err
		}
	}

	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.data, nil
}

// refresh recomputes benchmark data from the latest scan per unique domain.
func (b *BenchmarkService) refresh(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Get the latest score for each unique domain
	pipeline := mongo.Pipeline{
		// Sort by domain + createdAt desc so $first gives latest
		{{Key: "$sort", Value: bson.D{{Key: "domain", Value: 1}, {Key: "createdAt", Value: -1}}}},
		// Group by domain, take the latest score
		{{Key: "$group", Value: bson.M{
			"_id":   "$domain",
			"score": bson.M{"$first": "$compositeScore"},
		}}},
		// Only include valid scores
		{{Key: "$match", Value: bson.M{
			"score": bson.M{"$gt": 0, "$lte": 100},
		}}},
	}

	cursor, err := b.col.Aggregate(ctx, pipeline, options.Aggregate().SetAllowDiskUse(true))
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var results []struct {
		Domain string `bson:"_id"`
		Score  int    `bson:"score"`
	}
	if err := cursor.All(ctx, &results); err != nil {
		return err
	}

	if len(results) == 0 {
		return nil
	}

	scores := make([]int, len(results))
	sum := 0
	for i, r := range results {
		scores[i] = r.Score
		sum += r.Score
	}
	sort.Ints(scores)

	avg := sum / len(scores)
	median := scores[len(scores)/2]

	// Compute percentile markers
	percentiles := make([]int, 5)
	pcts := []float64{0.10, 0.25, 0.50, 0.75, 0.90}
	for i, p := range pcts {
		idx := int(p * float64(len(scores)-1))
		percentiles[i] = scores[idx]
	}

	data := &BenchmarkData{
		TotalStoresScanned: len(results),
		Percentiles:        percentiles,
		AverageScore:       avg,
		MedianScore:        median,
		UpdatedAt:          time.Now().UTC(),
	}

	b.mu.Lock()
	b.data = data
	b.scores = scores
	b.mu.Unlock()

	return nil
}

// LeaderboardEntry represents one store on the public leaderboard.
type LeaderboardEntry struct {
	Domain    string    `json:"domain"`
	Score     int       `json:"score"`
	ScannedAt time.Time `json:"scannedAt"`
}

// GetLeaderboard returns the top N stores by score.
func (b *BenchmarkService) GetLeaderboard(ctx context.Context, limit int) ([]LeaderboardEntry, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$sort", Value: bson.D{{Key: "domain", Value: 1}, {Key: "createdAt", Value: -1}}}},
		{{Key: "$group", Value: bson.M{
			"_id":       "$domain",
			"score":     bson.M{"$first": "$compositeScore"},
			"scannedAt": bson.M{"$first": "$createdAt"},
		}}},
		{{Key: "$match", Value: bson.M{"score": bson.M{"$gt": 0}}}},
		{{Key: "$sort", Value: bson.D{{Key: "score", Value: -1}}}},
		{{Key: "$limit", Value: limit}},
	}

	cursor, err := b.col.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []struct {
		Domain    string    `bson:"_id"`
		Score     int       `bson:"score"`
		ScannedAt time.Time `bson:"scannedAt"`
	}
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	entries := make([]LeaderboardEntry, len(results))
	for i, r := range results {
		entries[i] = LeaderboardEntry{Domain: r.Domain, Score: r.Score, ScannedAt: r.ScannedAt}
	}
	return entries, nil
}

// computePercentile returns what percentage of scores this score beats (0-100).
func computePercentile(sortedScores []int, score int) int {
	if len(sortedScores) == 0 {
		return 50
	}
	// Count how many scores are strictly less than this score
	below := sort.SearchInts(sortedScores, score)
	return int(float64(below) / float64(len(sortedScores)) * 100)
}
