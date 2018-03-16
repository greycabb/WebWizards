package projects

import (
	"gopkg.in/mgo.v2/bson"
)

//Store represents a store for Projects
type Store interface {
	//GetByProjectID returns the Project with the given ID
	GetByProjectID(projectID bson.ObjectId) (*Project, error)

	//GetByUserID returns the Projects with the given userID
	GetByUserID(userID string) ([]*Project, error)

	//Insert converts the NewProject to a Project, inserts
	//it into the database, and returns it
	Insert(newProject *NewProject) (*Project, error)

	//DeleteProject deletes the project with the given ID
	DeleteProject(projectID bson.ObjectId) error

	//Update updates the project
	Update(projID bson.ObjectId, updates *ProjectUpdates) error
}
