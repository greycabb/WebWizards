package handlers

import "net/http"

//ProjectsHandler handles requests for the "projects" resource if authenticated
func (ctx *HandlerContext) ProjectsHandler(w http.ResponseWriter, r *http.Request) {

	//Case for getting projects by a certain user

	//Case for creating a new project

	//Case for deleting a project

	//Case for updating a project's name

}

//BlocksHandler handles requests for the "blocks" resource if authenticated
func (ctx *HandlerContext) BlocksHandler(w http.ResponseWriter, r *http.Request) {

	//Case for adding a block

	//Case for updating content of a project

	//Case for updating a block's contents

	//Case for deleting a block

}
