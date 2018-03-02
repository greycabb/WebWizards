package projects

import (
	"github.com/greycabb/WebWizards/server/indexes"
	"gopkg.in/mgo.v2/bson"
)

//Store represents a store for Projects
type Store interface {
	//GetByProjectID returns the Project with the given ID
	GetByProjectID(projectID bson.ObjectId) (*Project, error)

	//GetByUserID returns the Project with the given ID
	GetByUserID(userID bson.ObjectId) ([]*Project, error)

	//GetByEmail returns the Projects with the given email
	GetByEmail(email string) ([]*Project, error)

	//GetByUserName returns the Projects with the given Username
	GetByUserName(username string) ([]*Project, error)

	//Insert converts the NewProject to a Project, inserts
	//it into the database, and returns it
	Insert(newProject *NewProject) (*Project, error)

	//Update applied the given project ID
	UpdateProject(projectID bson.ObjectId, updates *Updates) error

	//Delete deletes the project with the given ID
	Delete(projectID bson.ObjectId) error

	//LoadProjectsToTrie returns a Trie struct with all of the store's projects
	LoadProjectsToTrie() (*indexes.Trie, error)
}
