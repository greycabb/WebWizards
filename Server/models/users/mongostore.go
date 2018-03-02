package users

import (
	"fmt"
	"strings"

	"github.com/greycabb/WebWizards/server/indexes"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

//MongoStore implements Store for MongoDB
type MongoStore struct {
	session *mgo.Session
	dbname  string
	colname string
	col     *mgo.Collection
}

//NewMongoStore constructs a new MongoStore
func NewMongoStore(sess *mgo.Session, dbName string, collectionName string) *MongoStore {
	if sess == nil {
		panic("nil pointer passed for session")
	}
	return &MongoStore{
		session: sess,
		dbname:  dbName,
		colname: collectionName,
		col:     sess.DB(dbName).C(collectionName),
	}
}

//Insert converts the NewUser to a User, inserts it into the Mestore,
//and returns it.
func (s *MongoStore) Insert(newUser *NewUser) (*User, error) {
	user, err := newUser.ToUser()
	if err != nil {
		return nil, err
	}
	if err := s.col.Insert(user); err != nil {
		return nil, ErrInsert
	}
	return user, nil
}

//GetByID returns the User with the given ID
func (s *MongoStore) GetByID(id bson.ObjectId) (*User, error) {
	user := &User{}
	err := s.col.FindId(id).One(user)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

//GetByEmail returns the User structure with given email
func (s *MongoStore) GetByEmail(email string) (*User, error) {
	emailClean := strings.TrimSpace(strings.ToLower(email))
	user := &User{}
	err := s.col.Find(bson.M{"email": emailClean}).One(user)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

//GetByUserName returns the User structure with given username
func (s *MongoStore) GetByUserName(username string) (*User, error) {
	username = strings.ToLower(username)
	user := &User{}
	err := s.col.Find(bson.M{"username": username}).One(user)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

//Update applies UserUpdates to the given user ID
func (s *MongoStore) Update(userID bson.ObjectId, updates *Updates) error {
	user, err := s.GetByID(userID)
	if err != nil {
		return ErrUserNotFound
	}
	err = user.ApplyUpdates(updates)
	if err != nil {
		return ErrUpdating
	}
	prev, err := s.GetByID(userID)
	if err != nil {
		return ErrUserNotFound
	}
	return s.col.Update(prev, user)
}

//Delete deletes all state data associated with the userID from the store.
func (s *MongoStore) Delete(userID bson.ObjectId) error {
	user, err := s.GetByID(userID) // Check for any errors
	if err != nil {
		return ErrUserNotFound
	}
	return s.col.Remove(user)
}

//LoadUsersToTrie returns a Trie struct with all of the store's users
func (s *MongoStore) LoadUsersToTrie() (*indexes.Trie, error) {
	trie := indexes.NewTrie()
	var allUsers []User
	if err := s.col.Find(nil).All(&allUsers); err != nil {
		return nil, fmt.Errorf("error loading users: %v", err)
	}
	for _, user := range allUsers {
		id := user.ID
		trie.Set(strings.ToLower(user.Email), id)
		trie.Set(strings.ToLower(user.UserName), id)
		trie.Set(strings.ToLower(user.LastName), id)
		trie.Set(strings.ToLower(user.FirstName), id)
	}
	return trie, nil
}

//IdsToUsers accepts a slice of ObjectIds and returns a slice
//of User struct pointers
func (s *MongoStore) IdsToUsers(ids []bson.ObjectId) ([]*User, error) {
	var users []*User
	for _, id := range ids {
		user, err := s.GetByID(id)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
