package users

import (
	"errors"

	"github.com/greycabb/WebWizards/server/indexes"
	"gopkg.in/mgo.v2/bson"
)

//ErrUserNotFound is returned when the user can't be found
var ErrUserNotFound = errors.New("user not found")

//Store represents a store for Users
type Store interface {
	//GetByID returns the User with the given ID
	GetByID(id bson.ObjectId) (*User, error)

	//GetByEmail returns the User with the given email
	GetByEmail(email string) (*User, error)

	//GetByUserName returns the User with the given Username
	GetByUserName(username string) (*User, error)

	//Insert converts the NewUser to a User, inserts
	//it into the database, and returns it
	Insert(newUser *NewUser) (*User, error)

	//Update applies UserUpdates to the given user ID
	Update(userID bson.ObjectId, updates *Updates) error

	//Delete deletes the user with the given ID
	Delete(userID bson.ObjectId) error

	//LoadUsersToTrie returns a Trie struct with all of the store's users
	LoadUsersToTrie() (*indexes.Trie, error)

	//IdsToUsers converts a slice of ObjectIds to a slice of pointers to User structs
	IdsToUsers(ids []bson.ObjectId) ([]*User, error)
}
