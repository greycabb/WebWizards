package projects

import (
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

//Insert converts the NewProject to a Project, inserts it into the Mongotore,
//and returns it.
func (s *MongoStore) Insert(newProject *NewProject) (*Project, error) {
	proj := newProject.ToProject()
	if err := s.col.Insert(proj); err != nil {
		return nil, ErrInsert
	}
	return proj, nil
}

//GetByProjectID returns the Project with the given ID
func (s *MongoStore) GetByProjectID(id bson.ObjectId) (*Project, error) {
	proj := &Project{}
	err := s.col.FindId(id).One(proj)
	if err != nil {
		return nil, ErrProjectNotFound
	}
	return proj, nil
}

//GetByUserID returns the Projects structure array with given userID
func (s *MongoStore) GetByUserID(userid string) ([]*Project, error) {
	projects := []*Project{}
	err := s.col.Find(bson.M{"userid": userid}).All(&projects)
	if err != nil {
		return nil, ErrProjectNotFound
	}
	return projects, nil
}

//DeleteProject deletes all state data associated with the projectID from the store.
func (s *MongoStore) DeleteProject(projectID bson.ObjectId) error {
	proj, err := s.GetByProjectID(projectID) // Check for any errors
	if err != nil {
		return ErrProjectNotFound
	}
	return s.col.Remove(proj)
}

//Update applies UserUpdates to the given user ID
func (s *MongoStore) Update(projID bson.ObjectId, updates *ProjectUpdates) error {
	proj, err := s.GetByProjectID(projID)
	if err != nil {
		return ErrProjectNotFound
	}
	proj.ApplyProjectUpdates(updates)
	prev, err := s.GetByProjectID(projID)
	if err != nil {
		return ErrProjectNotFound
	}
	return s.col.Update(prev, proj)
}
