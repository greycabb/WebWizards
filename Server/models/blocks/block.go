package blocks

import (
	"gopkg.in/mgo.v2/bson"
)

var bcryptCost = 13

//NewBlock represents a user creating a new block
type NewBlock struct {
	BlockType int    `json:"blocktype"`
	ParentID  string `json:"parentid"`
}

//Block represents one html block in the database
type Block struct {
	ID        bson.ObjectId `json:"id" bson:"_id"`
	BlockType int           `json:"blocktype"`
	CSS       []*CSS        `json:"css"`
	ParentID  string        `json:"parentid"`
	Children  []*string     `json:"children"`
}

//CSS represents one css configuration
type CSS struct {
	Attribute string `json:"attribute"`
	Value     string `json:"value"`
}

//BlockUpdates represents possible updates to a block
type BlockUpdates struct {
	CSS      []*CSS    `json:"css"`
	ParentID string    `json:"parentid"`
	Children []*string `json:"children"`
}

//ToBlock converts the NewBlock to a Block
func (np *NewBlock) ToBlock() *Block {
	block := &Block{}
	block.ID = bson.NewObjectId()
	block.BlockType = np.BlockType
	block.CSS = []*CSS{}
	block.ParentID = np.ParentID
	block.Children = []*string{}
	return block
}

//UpdateBlock updates Block
func (b *Block) UpdateBlock(updates *BlockUpdates) *Block {
	b.CSS = updates.CSS
	b.ParentID = updates.ParentID
	b.Children = updates.Children
	return b
}
