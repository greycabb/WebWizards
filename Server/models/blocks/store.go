package blocks

import (
	"gopkg.in/mgo.v2/bson"
)

//Store represents a store for Projects
type Store interface {

	//GetByBlockID gets a block by its id
	GetByBlockID(id bson.ObjectId) (*Block, error)

	//InsertBlock inserts a new block into the project
	InsertBlock(newBlock *NewBlock) (*Block, error)

	//UpdateBlock applies updates to block
	UpdateBlock(blockID bson.ObjectId, updates *BlockUpdates) (*Block, error)

	//DeleteBlock deletes the block with the given ID
	DeleteBlock(blockID bson.ObjectId) error
}
