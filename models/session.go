package models

type Session struct {
	ID        string   `json:"id"`
	PoolKey   string   `json:"pool_key"`
	ActiveDB  string   `json:"active_db"`
	Databases []string `json:"databases"`
}
