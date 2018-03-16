package blocks

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

//GetByBlockID returns the Block with the given ID
func (s *MongoStore) GetByBlockID(id bson.ObjectId) (*Block, error) {
	block := &Block{}
	err := s.col.FindId(id).One(block)
	if err != nil {
		return nil, ErrBlockNotFound
	}
	return block, nil
}

//InsertBlock inserts a new block into the database
func (s *MongoStore) InsertBlock(newBlock *NewBlock) (*Block, error) {
	block := newBlock.ToBlock()
	if err := s.col.Insert(block); err != nil {
		return nil, ErrInsert
	}
	return block, nil
}

//UpdateBlock applies UserUpdates to the given user ID
func (s *MongoStore) UpdateBlock(blockid bson.ObjectId, updates *BlockUpdates) (*Block, error) {
	block, err := s.GetByBlockID(blockid)
	if err != nil {
		return nil, ErrBlockNotFound
	}
	new := block.UpdateBlock(updates)
	prev, err := s.GetByBlockID(blockid)
	if err != nil {
		return nil, ErrBlockNotFound
	}
	return new, s.col.Update(prev, new)
}

//DeleteBlock deletes a block from the project
func (s *MongoStore) DeleteBlock(blockid bson.ObjectId) error {
	block, err := s.GetByBlockID(blockid) // Check for any errors
	if err != nil {
		return ErrBlockNotFound
	}
	return s.col.Remove(block)
}
