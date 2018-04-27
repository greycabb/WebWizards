package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/greycabb/WebWizards/server/models/users"
	"github.com/greycabb/WebWizards/server/sessions"
	"gopkg.in/mgo.v2/bson"
)

//UsersHandler handles requests for the "users" resource and
//allows clients to create new user accounts and search for users if authenticated
func (ctx *HandlerContext) UsersHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		//user := state.Authenticated
		id := r.URL.Query().Get("id")
		if len(id) > 0 {
			user, err := ctx.usersStore.GetByID(bson.ObjectIdHex(id))
			if err != nil {
				http.Error(w, fmt.Sprintf("error getting user: %v", err), http.StatusInternalServerError)
				return
			}
			respond(w, user)
		}
		name := r.URL.Query().Get("name")
		if len(name) > 0 {
			user, err := ctx.usersStore.GetByUserName(name)
			if err != nil {
				http.Error(w, fmt.Sprintf("error getting user: %v", err), http.StatusInternalServerError)
				return
			}
			respond(w, user)
		}
		//users, err := ctx.usersStore.IdsToUsers(ctx.trie.Get(q, 20))

	case "POST":
		//Decode request body into users.NewUser struct
		newUser := &users.NewUser{}
		if err := json.NewDecoder(r.Body).Decode(newUser); err != nil {
			http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		err := newUser.Validate()
		if err != nil {
			http.Error(w, fmt.Sprint(err), http.StatusBadRequest)
			return
		}
		//Ensure there is no existing user, and insert if so
		if _, err := ctx.usersStore.GetByUserName(newUser.UserName); err == nil {
			http.Error(w, fmt.Sprintf("username already in use"), http.StatusBadRequest)
			return
		}
		if len(newUser.Email) > 0 {
			if _, err := ctx.usersStore.GetByEmail(newUser.Email); err == nil {
				http.Error(w, fmt.Sprintf("email already in use"), http.StatusBadRequest)
				return
			}
		}
		user, err := ctx.usersStore.Insert(newUser)
		if err != nil {
			http.Error(w, fmt.Sprintf("error inserting user to store"), http.StatusBadRequest)
			return
		}
		//Insert user into trie
		ctx.trie.Set(strings.ToLower(user.Email), user.ID)
		ctx.trie.Set(strings.ToLower(user.UserName), user.ID)
		ctx.trie.Set(strings.ToLower(user.LastName), user.ID)
		ctx.trie.Set(strings.ToLower(user.FirstName), user.ID)

		ctx.BeginSession(user, w)
		// Respond to client with StatusCreatedCode and encoded user object
		w.WriteHeader(http.StatusCreated)
		respond(w, user)
	default:
		http.Error(w, "method must be POST", http.StatusMethodNotAllowed)
		return
	}
}

//UsersMeHandler handles requests for current user resource
//Supports GET and PATCH HTTP methods
func (ctx *HandlerContext) UsersMeHandler(w http.ResponseWriter, r *http.Request) {
	// Get sessionID
	id, err := sessions.GetSessionID(r, ctx.SigningKey)
	if err != nil {
		http.Error(w, fmt.Sprintf("error getting sessionID"), http.StatusUnauthorized)
		return
	}
	// Get SessionState with sessionID
	state := &SessionState{}
	err = ctx.SessionStore.Get(id, &state)
	if err != nil {
		http.Error(w, fmt.Sprintf("error retrieving SessionState"), http.StatusUnauthorized)
		return
	}
	user := state.Authenticated
	switch r.Method {
	case "GET":
		// Respond with encoded user information from state
		info, err := ctx.usersStore.GetByID(state.Authenticated.ID)
		if err != nil {
			http.Error(w, fmt.Sprintf("error getting user"), http.StatusUnauthorized)
			return
		}
		respond(w, info)
	case "PATCH":
		// Get updates
		update := &users.Updates{}
		if err := json.NewDecoder(r.Body).Decode(update); err != nil {
			http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		// Get user ID from state and update user store
		userID := state.Authenticated.ID
		err = ctx.usersStore.Update(userID, update)
		if err != nil {
			http.Error(w, fmt.Sprintf("error updating user store: %v", err), http.StatusBadRequest)
			return
		}
		// Cache updated user data to session store and send http response with updated user
		updatedUser, err := ctx.usersStore.GetByID(userID)
		if err != nil {
			http.Error(w, fmt.Sprintf("error getting user: %v", err), http.StatusBadRequest)
			return
		}
		state.Authenticated = updatedUser
		ctx.SessionStore.Save(id, state)
		//Update trie for user's first name and last name
		ctx.trie.Remove(user.FirstName, userID)
		ctx.trie.Remove(user.LastName, userID)
		ctx.trie.Set(updatedUser.FirstName, userID)
		ctx.trie.Set(updatedUser.LastName, userID)

		respond(w, updatedUser)
	}
}

//SessionsHandler handles requests for the sessions resource, allowing
//clients to begin new sessions using an existing user's credentials.
//Supports POST method, requiring that the request body contain JSON
//that can be decoded into the users.Credentials struct.
func (ctx *HandlerContext) SessionsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		creds := &users.Credentials{}
		if err := json.NewDecoder(r.Body).Decode(creds); err != nil {
			http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		// Check if user email is found. If so, check authentication
		user, err := ctx.usersStore.GetByUserName(creds.UserName)
		if err != nil {
			http.Error(w, fmt.Sprintf("invalid credentials"), http.StatusUnauthorized)
			return
		}
		err = user.Authenticate(creds.Password)
		if err != nil {
			http.Error(w, fmt.Sprintf("invalid credentials"), http.StatusUnauthorized)
			return
		}
		// Begin session and send response with encoded User object
		ctx.BeginSession(user, w)
		respond(w, user)
	default:
		http.Error(w, "method must be POST", http.StatusMethodNotAllowed)
		return
	}
}

//SessionsMineHandler requests for the current session resource, allowing
//clients to end the current session. HTTP method is DELETE
func (ctx *HandlerContext) SessionsMineHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "DELETE":
		_, err := sessions.EndSession(r, ctx.SigningKey, ctx.SessionStore)
		if err != nil {
			http.Error(w, fmt.Sprintf("error ending session: %v", err), http.StatusUnauthorized)
			return
		}
		respond(w, "signed out")
	default:
		http.Error(w, "method must be DELETE", http.StatusMethodNotAllowed)
		return
	}
}

//BeginSession helper method begins a new session with given user
func (ctx *HandlerContext) BeginSession(user *users.User, w http.ResponseWriter) {
	state := NewSessionState(time.Now(), user)
	_, err := sessions.BeginSession(ctx.SigningKey, ctx.SessionStore, state, w)
	if err != nil {
		http.Error(w, fmt.Sprintf("error beginning session: %v", err), http.StatusInternalServerError)
		return
	}
}
