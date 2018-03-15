package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/greycabb/WebWizards/Server/models/projects"

	"github.com/greycabb/WebWizards/server/sessions"
	"gopkg.in/mgo.v2/bson"
)

//ProjectHandler handles requests for the "project" resource if authenticated
func (ctx *HandlerContext) ProjectHandler(w http.ResponseWriter, r *http.Request) {
	//Check for authentication
	id, err := sessions.GetSessionID(r, ctx.SigningKey)
	if err != nil {
		http.Error(w, fmt.Sprintf("error getting sessionID"), http.StatusUnauthorized)
		return
	} // Get SessionState with sessionID
	state := &SessionState{}
	err = ctx.SessionStore.Get(id, &state)
	if err != nil {
		http.Error(w, fmt.Sprintf("error retrieving SessionState"), http.StatusUnauthorized)
		return
	}
	userID := state.Authenticated.ID
	switch r.Method {
	//Case for getting a specific projet by project id
	case "GET":
		id := r.URL.Query().Get("id")
		if len(id) == 0 {
			http.Error(w, "Please provide a correct project id", http.StatusBadRequest)
			return
		}
		hexed := bson.ObjectIdHex(id)
		proj, err := ctx.projectStore.GetByProjectID(hexed)
		if err != nil {
			http.Error(w, fmt.Sprintf("error getting project id: %v", err), http.StatusBadRequest)
		}
		respond(w, proj)

	//Case for creating a new project
	case "POST":
		newProject := &projects.NewProject{}
		if err := json.NewDecoder(r.Body).Decode(newProject); err != nil {
			http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		newProject.UserID = userID
		proj, err := ctx.projectStore.Insert(newProject)
		if err != nil {
			http.Error(w, fmt.Sprintf("error inserting project to store"), http.StatusBadRequest)
			return
		}
		respond(w, proj)
	//Case for deleting a project
	case "DELETE":
		id := r.URL.Query().Get("id")
		if len(id) == 0 {
			http.Error(w, "Please provide a correct project id", http.StatusBadRequest)
			return
		}
		hexed := bson.ObjectIdHex(id)
		err := ctx.projectStore.DeleteProject(hexed)
		if err != nil {
			http.Error(w, fmt.Sprintf("error deleting project"), http.StatusBadRequest)
			return
		}
	//Case for updating a project's name
	case "UPDATE":
		id := r.URL.Query().Get("id")
		if len(id) == 0 {
			http.Error(w, "Please provide a correct project id", http.StatusBadRequest)
			return
		}
		hexed := bson.ObjectIdHex(id)
		updates := &projects.ProjectUpdates{}
		if err := json.NewDecoder(r.Body).Decode(updates); err != nil {
			http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		proj, err := ctx.projectStore.GetByProjectID(hexed)
		if err != nil {
			http.Error(w, fmt.Sprintf("error getting project id: %v", err), http.StatusBadRequest)
		}
		updated, err := proj.ApplyProjectUpdates(updates)
		if err != nil {
			http.Error(w, fmt.Sprintf("error applying updats: %v", err), http.StatusBadRequest)
		}
		respond(w, updated)
	}
}

//BlocksHandler handles requests for the "blocks" resource if authenticated
func (ctx *HandlerContext) BlocksHandler(w http.ResponseWriter, r *http.Request) {

	//Case for adding a block

	//Case for updating content of a project

	//Case for updating a block's contents

	//Case for deleting a block

}
