package projects

import (
	"log"
	"testing"

	"github.com/greycabb/WebWizards/Server/models/projects"
	mgo "gopkg.in/mgo.v2"
)

// Test MongoStore object
// Must have an existing docker container running for mongo at port 27017
func TestMongoStore(t *testing.T) {
	newProject := &projects.NewProject{
		"fakeid",
		"A project name",
		[]string{},
		"y",
	}
	newProject2 := &projects.NewProject{
		"fakeid",
		"A project name 2",
		[]string{},
		"n",
	}
	mongoSess, err := mgo.Dial("localhost:27017")
	if err != nil {
		log.Fatalf("error dialing mongo: %v", err)
	}
	store := projects.NewMongoStore(mongoSess, "projectDB", "projects")
	// Testing insertion
	proj, err := store.Insert(newProject)
	if err != nil {
		t.Fatalf("error inserting: %v", err)
	}
	_, err = store.Insert(newProject2)
	if err != nil {
		t.Fatalf("error inserting: %v", err)
	}
	projID := proj.ID
	// Testing get method
	proj, err = store.GetByProjectID(projID)
	if err != nil {
		t.Fatalf("error getting user by id: %v", err)
	}
	_, err = store.GetByProjectID("fake id")
	if err != ErrProjectNotFound {
		t.Fatalf("expected %v but got %v", ErrProjectNotFound, err)
	}
	// Testing update functionality
	updates := &projects.ProjectUpdates{
		Name: "New Name",
	}
	err = store.Update(projID, updates)
	if err != nil {
		t.Fatalf("error updating: %v", err)
	}
	err = store.Update("fakeID", updates)
	if err != ErrProjectNotFound {
		t.Fatalf("expected %v but got %v", ErrProjectNotFound, err)
	}
	proj, _ = store.GetByProjectID(projID)
	if proj.Name != "New Name" {
		t.Fatalf("value in project structure did not update, expected New Name got %s", proj.Name)
	}
	// Testing delete functionality
	err = store.DeleteProject(projID)
	if err != nil {
		t.Fatalf("error deleting userID: %v", err)
	}
	_, err = store.GetByProjectID(projID)
	if err != ErrProjectNotFound {
		t.Fatalf("expected %v but got %v", ErrProjectNotFound, err)
	}
	err = store.DeleteProject("fakeID")
	if err != ErrProjectNotFound {
		t.Fatalf("expected %v but got %v", ErrProjectNotFound, err)
	}
}
