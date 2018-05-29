package handlers

import (
	"time"

	"github.com/greycabb/WebWizards/Server/models/users"
)

//SessionState represents the session's state including the time
//the state began and the authenticated user's information
type SessionState struct {
	StateTime     time.Time   `json:"time,omitempty"`
	Authenticated *users.User `json:"user,omitempty"`
}

//NewSessionState constructs a new SessionState
func NewSessionState(stateTime time.Time, authenticated *users.User) *SessionState {
	return &SessionState{
		StateTime:     stateTime,
		Authenticated: authenticated,
	}
}
