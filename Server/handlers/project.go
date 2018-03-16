package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/greycabb/WebWizards/Server/models/blocks"

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
	}
	// Get SessionState with sessionID
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
		if proj.UserID != userID && proj.Private == "y" {
			http.Error(w, fmt.Sprintf("this project is private"), http.StatusBadRequest)
			return
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
		proj, err := ctx.projectStore.GetByProjectID(hexed)
		if proj.UserID != userID {
			http.Error(w, fmt.Sprintf("you can only delete your own projects"), http.StatusBadRequest)
			return
		}
		err = ctx.projectStore.DeleteProject(hexed)
		if err != nil {
			http.Error(w, fmt.Sprintf("error deleting project"), http.StatusBadRequest)
			return
		}
	//Case for updating a project's name
	case "PATCH":
		id := r.URL.Query().Get("id")
		if len(id) == 0 {
			http.Error(w, "Please provide a correct project id", http.StatusBadRequest)
			return
		}
		hexed := bson.ObjectIdHex(id)
		proj, err := ctx.projectStore.GetByProjectID(hexed)
		if proj.UserID != userID {
			http.Error(w, fmt.Sprintf("you can only edit your own projects"), http.StatusBadRequest)
			return
		}
		updates := &projects.ProjectUpdates{}
		if err := json.NewDecoder(r.Body).Decode(updates); err != nil {
			http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		err = ctx.projectStore.Update(hexed, updates)
		if err != nil {
			http.Error(w, fmt.Sprintf("error applying updats: %v", err), http.StatusBadRequest)
		}
	}
}

//BlocksHandler handles requests for the "blocks" resource if authenticated
func (ctx *HandlerContext) BlocksHandler(w http.ResponseWriter, r *http.Request) {
	//Check for authentication
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
	userID := state.Authenticated.ID
	switch r.Method {
	//Case for getting a block
	case "GET":
		id := r.URL.Query().Get("id")
		if len(id) == 0 {
			http.Error(w, "Please provide a correct block id", http.StatusBadRequest)
			return
		}
		hexed := bson.ObjectIdHex(id)
		block, err := ctx.blockStore.GetByBlockID(hexed)
		if err != nil {
			http.Error(w, fmt.Sprintf("error getting block id: %v", err), http.StatusBadRequest)
		}
		respond(w, block)

	//Case for adding a block
	case "POST":
		newBlock := &blocks.NewBlock{}
		newBlock.UserID = userID
		if err := json.NewDecoder(r.Body).Decode(newBlock); err != nil {
			http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		//Now insert block into store
		block, err := ctx.blockStore.InsertBlock(newBlock)
		if err != nil {
			http.Error(w, fmt.Sprintf("error inserting block to store"), http.StatusBadRequest)
			return
		}
		//Add to new parent block
		newParentHex := bson.ObjectIdHex(newBlock.ParentID)
		newParentBlock, err := ctx.blockStore.GetByBlockID(newParentHex)
		if err != nil {
			http.Error(w, fmt.Sprintf("error finding newparent block"), http.StatusBadRequest)
			return
		}
		newParentChildren := newParentBlock.Children
		if len(newParentChildren) > 0 {
			newParentChildren = append(newParentChildren[:newBlock.Index], block.ID.Hex())
			newParentChildren = append(newParentChildren, newParentChildren[newBlock.Index:]...)
		} else {
			newParentChildren = append(newParentChildren, block.ID.Hex())
		}
		newParentUpdates := &blocks.BlockUpdates{}
		newParentUpdates.Children = newParentChildren
		ctx.blockStore.UpdateBlock(newParentHex, newParentUpdates)
		respond(w, block)

	//Case for updating content of a block
	case "PATCH":
		id := r.URL.Query().Get("id")
		if len(id) == 0 {
			http.Error(w, "Please provide a correct block id", http.StatusBadRequest)
			return
		}
		hexed := bson.ObjectIdHex(id)
		block, err := ctx.blockStore.GetByBlockID(hexed)
		if block.UserID != userID {
			http.Error(w, fmt.Sprintf("you can only update your own blocks"), http.StatusBadRequest)
			return
		}
		updates := &blocks.BlockUpdates{}
		if err := json.NewDecoder(r.Body).Decode(updates); err != nil {
			http.Error(w, fmt.Sprintf("error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		//Check to see if parentID has changed aka location
		if updates.ParentID != block.ParentID {
			//Remove from parent block here
			block, err := ctx.blockStore.GetByBlockID(hexed)
			if err != nil {
				http.Error(w, fmt.Sprintf("error finding block"), http.StatusBadRequest)
				return
			}
			parentHex := bson.ObjectIdHex(block.ParentID)
			parentBlock, err := ctx.blockStore.GetByBlockID(parentHex)
			if err != nil {
				http.Error(w, fmt.Sprintf("error finding parent block"), http.StatusBadRequest)
				return
			}
			parentChildren := parentBlock.Children
			parentChildren = append(parentChildren[:block.Index], parentChildren[block.Index:]...)
			parentUpdates := &blocks.BlockUpdates{}
			parentUpdates.Children = parentChildren
			ctx.blockStore.UpdateBlock(parentHex, parentUpdates)
			//Add to new parent block
			newParentHex := bson.ObjectIdHex(updates.ParentID)
			newParentBlock, err := ctx.blockStore.GetByBlockID(newParentHex)
			if err != nil {
				http.Error(w, fmt.Sprintf("error finding newparent block"), http.StatusBadRequest)
				return
			}
			newParentChildren := newParentBlock.Children
			if len(newParentChildren) > 0 {
				newParentChildren = append(newParentChildren[:updates.Index], block.ID.Hex())
				newParentChildren = append(newParentChildren, newParentChildren[updates.Index:]...)
			} else {
				newParentChildren = append(newParentChildren, block.ID.Hex())
			}
			newParentUpdates := &blocks.BlockUpdates{}
			newParentUpdates.Children = newParentChildren
			ctx.blockStore.UpdateBlock(newParentHex, newParentUpdates)
		}
		updated, err := ctx.blockStore.UpdateBlock(hexed, updates)
		if err != nil {
			http.Error(w, fmt.Sprintf("error updating: %v", err), http.StatusBadRequest)
		}
		respond(w, updated)

	//Case for deleting a block
	case "DELETE":
		id := r.URL.Query().Get("id")
		if len(id) == 0 {
			http.Error(w, "Please provide a correct block id", http.StatusBadRequest)
			return
		}
		hexed := bson.ObjectIdHex(id)
		block, err := ctx.blockStore.GetByBlockID(hexed)
		if block.UserID != userID {
			http.Error(w, fmt.Sprintf("you can only delete your own blocks"), http.StatusBadRequest)
			return
		}
		//Remove from parent block here
		if len(block.ParentID) > 0 {
			parentHex := bson.ObjectIdHex(block.ParentID)
			parentBlock, err := ctx.blockStore.GetByBlockID(parentHex)
			if err != nil {
				http.Error(w, fmt.Sprintf("error finding parent block"), http.StatusBadRequest)
				return
			}
			parentChildren := parentBlock.Children
			parentChildren = append(parentChildren[:block.Index], parentChildren[block.Index:]...)
			parentUpdates := &blocks.BlockUpdates{}
			parentUpdates.Children = parentChildren
			ctx.blockStore.UpdateBlock(parentHex, parentUpdates)
		}
		//Now delete original block
		err = ctx.blockStore.DeleteBlock(hexed)
		if err != nil {
			http.Error(w, fmt.Sprintf("error deleting block"), http.StatusBadRequest)
			return
		}
	}
}
