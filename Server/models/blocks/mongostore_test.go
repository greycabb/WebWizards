package blocks

import (
	"log"
	"testing"

	"github.com/greycabb/WebWizards/Server/models/blocks"
	mgo "gopkg.in/mgo.v2"
)

// Test MongoStore object
// Must have an existing docker container running for mongo at port 27017
func TestMongoStore(t *testing.T) {
	newBlock := &blocks.NewBlock{
		"fakeid",
		1,
		"fakeparentid",
		1,
		"fakeprojectid",
	}
	newBlock2 := &blocks.NewBlock{
		"fakeid",
		2,
		"fakeparentid",
		1,
		"fakeprojectid",
	}
	mongoSess, err := mgo.Dial("localhost:27017")
	if err != nil {
		log.Fatalf("error dialing mongo: %v", err)
	}
	store := blocks.NewMongoStore(mongoSess, "blockDB", "blocks")
	// Testing insertion
	block, err := store.InsertBlock(newBlock)
	if err != nil {
		t.Fatalf("error inserting: %v", err)
	}
	_, err = store.InsertBlock(newBlock2)
	if err != nil {
		t.Fatalf("error inserting: %v", err)
	}
	blockID := block.ID
	// Testing get method
	block, err = store.GetByBlockID(blockID)
	if err != nil {
		t.Fatalf("error getting user by id: %v", err)
	}
	_, err = store.GetByBlockID("fake id")
	if err != ErrBlockNotFound {
		t.Fatalf("expected %v but got %v", ErrBlockNotFound, err)
	}
	// Testing update functionality
	updates := &blocks.BlockUpdates{
		Index: 1,
	}
	block.UpdateBlock(updates)
	block, _ = store.GetByBlockID(blockID)
	if block.Index != 1 {
		t.Fatalf("value in Block structure did not update, expected 1 got %v", block.Index)
	}
	// Testing delete functionality
	err = store.DeleteBlock(blockID)
	if err != nil {
		t.Fatalf("error deleting userID: %v", err)
	}
	_, err = store.GetByBlockID(blockID)
	if err != ErrBlockNotFound {
		t.Fatalf("expected %v but got %v", ErrBlockNotFound, err)
	}
	err = store.DeleteBlock("fakeID")
	if err != ErrBlockNotFound {
		t.Fatalf("expected %v but got %v", ErrBlockNotFound, err)
	}
}
