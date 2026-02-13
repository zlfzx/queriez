package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"queriez-core/core"
	"queriez-core/core/model"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	engine *core.Engine
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	engine = core.NewEngine()
	// pool = queriez.NewPoolManager()
	// sm = queriez.NewSessionManager(pool)
}

func (a *App) TestConnect(dbConfig string) (err error) {
	var config model.DBConfig
	err = json.Unmarshal([]byte(dbConfig), &config)
	if err != nil {
		slog.Error("failed to unmarshal db config", "error", err)
		return err
	}

	err = engine.TestConnection(config)
	if err != nil {
		slog.Error("failed to test connect", "error", err)
		return err
	}

	slog.Info("test connection successful")
	return nil
}

func (a *App) Connect(dbConfig string) (conn *model.ConnectResult, err error) {
	var config model.DBConfig
	err = json.Unmarshal([]byte(dbConfig), &config)
	if err != nil {
		slog.Error("failed to unmarshal db config", "error", err)
		return nil, err
	}

	conn, err = engine.Connect(config)
	if err != nil {
		slog.Error("failed to connect", "error", err)
		return nil, err
	}

	slog.Info("connection successful", conn.SessionID, conn.PoolKey)
	return conn, nil
}

func (a *App) NewTab(sessionID string) (conn *model.ConnectResult, err error) {
	conn, err = engine.AddSession(sessionID)
	if err != nil {
		slog.Error("failed to add session", "error", err)
		return nil, err
	}

	slog.Info("new tab session created", conn.SessionID, conn.PoolKey)
	return conn, nil
}

func (a *App) SetActiveDatabase(sessionID, dbName string) (newPoolKey string, err error) {
	newPoolKey, err = engine.SetActiveDatabase(sessionID, dbName)
	if err != nil {
		slog.Error("failed to set active database", "error", err)
		return "", err
	}

	slog.Info("active database set", "sessionID", sessionID, "database", dbName)
	return newPoolKey, nil
}

func (a *App) RunQuery(sessionID, query string) (result []*model.SQLResult, err error) {
	result, err = engine.RunQuery(sessionID, query)
	if err != nil {
		slog.Error("failed to run query", "error", err)
		return nil, err
	}

	slog.Info("query executed", "sessionID", sessionID)
	return result, nil
}

func (a *App) CancelQuery(sessionID string) (err error) {
	err = engine.CancelQuery(sessionID)
	if err != nil {
		slog.Error("failed to cancel query", "error", err)
		return err
	}

	slog.Info("query cancelled", "sessionID", sessionID)
	return nil
}

// func (a *App) NewSession(dbConfig string) (sess models.Session, err error) {
// 	var config model.DBConfig
// 	err = json.Unmarshal([]byte(dbConfig), &config)
// 	if err != nil {
// 		slog.Error("failed to unmarshal db config", "error", err)
// 		return sess, err
// 	}

// 	// uuid for session ID
// 	sessionID := uuid.New().String()

// 	return a.CreateSession(sessionID, config)
// }

// func (a *App) AddSession(sessionId string) (sess models.Session, err error) {
// 	_sessionID, err := uuid.Parse(sessionId)
// 	if err != nil {
// 		slog.Error("Invalid session ID:", "error", err)
// 		return sess, err
// 	}
// 	sessionID := _sessionID.String()

// 	// get existing session
// 	session, err := sm.GetSession(sessionID)
// 	if err != nil {
// 		slog.Error("Error getting session:", "error", err)
// 		return sess, err
// 	}

// 	// create a new session based on the existing session's pool config
// 	config := pool.Configs[session.PoolKey]
// 	newSessionID := uuid.New().String()

// 	return a.CreateSession(newSessionID, config)
// }

// func (a *App) CreateSession(sessionID string, config model.DBConfig) (sess models.Session, err error) {
// 	session, err := sm.CreateSession(sessionID, config)
// 	if err != nil {
// 		slog.Error("Error creating new session for tab:", "error", err)
// 		return sess, err
// 	}

// 	sess.ID = session.ID
// 	sess.PoolKey = session.PoolKey
// 	if databases, err := sm.ListDatabases(sessionID); err == nil {
// 		sess.Databases = databases
// 	}

// 	slog.Info("Created new tab session", "sessionID", sessionID)
// 	return sess, nil
// }

// func (a *App) ListDatabases(sessionID string) (dbs []string, err error) {
// 	dbs, err = sm.ListDatabases(sessionID)
// 	if err != nil {
// 		slog.Error("Error listing databases:", "error", err)
// 		return dbs, err
// 	}

// 	// fmt.Println("Databases:", dbs)
// 	return dbs, nil
// }

// func (a *App) ListTables(sessionID, dbName string) (tables []string, err error) {
// 	tables, err = sm.ListTables(sessionID, dbName)
// 	if err != nil {
// 		fmt.Println("Error listing tables:", err)
// 		return tables, err
// 	}

// 	// fmt.Println("Tables in database", dbName, ":", tables)
// 	return tables, nil
// }

func (a *App) EmitError(errMsg string) {
	runtime.EventsEmit(a.ctx, "errorOccurred", errMsg)
}
