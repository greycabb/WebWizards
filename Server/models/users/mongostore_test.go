package users

import (
	"log"
	"testing"

	mgo "gopkg.in/mgo.v2"
)

// Test MongoStore object
// Must have an existing docker container running for mongo at port 27017
func TestMongoStore(t *testing.T) {
	newUser := &NewUser{
		"leemeli@uw.edu",
		"password",
		"password",
		"leemeli",
		"Melody",
		"Lee",
	}
	newUser2 := &NewUser{
		"genuine.mel@gmail.com",
		"password2",
		"password2",
		"lily",
		"nnelody",
		"legend",
	}
	mongoSess, err := mgo.Dial("mongodb://localhost:27017")
	if err != nil {
		log.Fatalf("error dialing mongo: %v", err)
	}
	store := NewMongoStore(mongoSess, "userDB", "users")
	// Testing insertion
	user, err := store.Insert(newUser)
	if err != nil {
		t.Fatalf("error inserting: %v", err)
	}
	_, err = store.Insert(newUser2)
	if err != nil {
		t.Fatalf("error inserting: %v", err)
	}
	userID := user.ID
	// Testing get methods
	user, err = store.GetByID(userID)
	if err != nil {
		t.Fatalf("error getting user by id: %v", err)
	}
	_, err = store.GetByID("fake id")
	if err != ErrUserNotFound {
		t.Fatalf("expected %v but got %v", ErrUserNotFound, err)
	}
	_, err = store.GetByEmail("genuine.mel@gmail.com")
	if err != nil {
		t.Fatalf("error getting user by email: %v", err)
	}
	_, err = store.GetByEmail("fakeemail@uw.edu")
	if err != ErrUserNotFound {
		t.Fatalf("expected %v but got %v", ErrUserNotFound, err)
	}
	_, err = store.GetByUserName("lily")
	if err != nil {
		t.Fatalf("error getting user by username: %v", err)
	}
	_, err = store.GetByUserName("fakeUser")
	if err != ErrUserNotFound {
		t.Fatalf("expected %v but got %v", ErrUserNotFound, err)
	}
	// Testing update functionality
	updates := &Updates{
		FirstName: "New",
		LastName:  "Name",
	}
	badUpdates := &Updates{
		FirstName: "",
		LastName:  "B",
	}
	err = store.Update(userID, updates)
	if err != nil {
		t.Fatalf("error updating: %v", err)
	}
	err = store.Update("fakeID", updates)
	if err != ErrUserNotFound {
		t.Fatalf("expected %v but got %v", ErrUserNotFound, err)
	}
	err = store.Update(userID, badUpdates)
	if err != ErrUpdating {
		t.Fatalf("expected %v but got %v", ErrUpdating, err)
	}
	user, _ = store.GetByID(userID)
	if user.FirstName != "New" {
		t.Fatalf("value in user structure did not update, expected New got %s", user.FirstName)
	}
	// Testing delete functionality
	err = store.Delete(userID)
	if err != nil {
		t.Fatalf("error deleting userID: %v", err)
	}
	_, err = store.GetByID(userID)
	if err != ErrUserNotFound {
		t.Fatalf("expected %v but got %v", ErrUserNotFound, err)
	}
	err = store.Delete("fakeID")
	if err != ErrUserNotFound {
		t.Fatalf("expected %v but got %v", ErrUserNotFound, err)
	}
}
