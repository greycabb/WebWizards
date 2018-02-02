package sessions

import (
	"errors"
	"net/http"
	"strings"
)

const headerAuthorization = "Authorization"
const paramAuthorization = "auth"
const schemeBearer = "Bearer "

//ErrNoSessionID is used when no session ID was found in the Authorization header
var ErrNoSessionID = errors.New("no session ID found in " + headerAuthorization + " header")

//ErrInvalidScheme is used when the authorization scheme is not supported
var ErrInvalidScheme = errors.New("authorization scheme not supported")

//BeginSession creates a new SessionID, saves the `sessionState` to the store, adds an
//Authorization header to the response with the SessionID, and returns the new SessionID
func BeginSession(SigningKey string, store Store, sessionState interface{}, w http.ResponseWriter) (SessionID, error) {
	id, err := NewSessionID(SigningKey)
	if err != nil {
		return InvalidSessionID, err
	}
	store.Save(id, sessionState)
	w.Header().Add(headerAuthorization, schemeBearer+string(id))
	return id, nil
}

//GetSessionID extracts and validates the SessionID from the request headers
func GetSessionID(r *http.Request, SigningKey string) (SessionID, error) {
	val := r.Header.Get(headerAuthorization)
	if len(val) == 0 {
		val = r.URL.Query().Get(paramAuthorization)
	}
	if !strings.Contains(val, schemeBearer) {
		return InvalidSessionID, ErrInvalidScheme
	}
	id := strings.Split(val, " ")[1]
	return ValidateID(id, SigningKey)
}

//GetState extracts the SessionID from the request,
//gets the associated state from the provided store into
//the `sessionState` parameter, and returns the SessionID
func GetState(r *http.Request, SigningKey string, store Store, sessionState interface{}) (SessionID, error) {
	id, err := GetSessionID(r, SigningKey)
	if err != nil {
		return InvalidSessionID, err
	}
	err = store.Get(id, sessionState)
	return id, err
}

//EndSession extracts the SessionID from the request,
//and deletes the associated data in the provided store, returning
//the extracted SessionID.
func EndSession(r *http.Request, SigningKey string, store Store) (SessionID, error) {
	id, err := GetSessionID(r, SigningKey)
	if err != nil {
		return InvalidSessionID, err
	}
	store.Delete(id)
	return id, nil
}
