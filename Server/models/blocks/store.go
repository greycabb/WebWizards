package blocks

import (
	"gopkg.in/mgo.v2/bson"
)

//Store represents a store for Projects
type Store interface {
	//InsertBlock inserts a new block into the project
	InsertBlock(block *Block, projectID bson.ObjectId) error

	//UpdateBlock applies updates to block
	UpdateBlock(blockID bson.ObjectId, updates *BlockUpdates)

	//DeleteBlock deletes the block with the given ID
	DeleteBlock(blockID bson.ObjectId, projectID bson.ObjectId) error
}
