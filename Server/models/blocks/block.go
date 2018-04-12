package blocks

import (
	"gopkg.in/mgo.v2/bson"
)

var bcryptCost = 13

//NewBlock represents a user creating a new block
type NewBlock struct {
	UserID    bson.ObjectId `json:"userid"`
	BlockType int           `json:"blocktype"`
	ParentID  string        `json:"parentid"`
	Index     int           `json:"index"`
	ProjectID string        `json:"projectid"`
}

//Block represents one html block in the database
type Block struct {
	ID         bson.ObjectId `json:"id" bson:"_id"`
	UserID     bson.ObjectId `json:"userid"`
	BlockType  int           `json:"blocktype"`
	CSS        []*CSS        `json:"css"`
	ParentID   string        `json:"parentid"`
	Index      int           `json:"index"`
	Children   []string      `json:"children"`
	ProjectID  string        `json:"projectid"`
	Attributes string        `json:"attributes"`
}

//CSS represents one css configuration
type CSS struct {
	Attribute string `json:"attribute"`
	Value     string `json:"value"`
}

//BlockUpdates represents possible updates to a block
type BlockUpdates struct {
	CSS        []*CSS   `json:"css"`
	ParentID   string   `json:"parentid"`
	Index      int      `json:"index"`
	Children   []string `json:"children"`
	Attributes string   `json:"attributes"`
}

//ToBlock converts the NewBlock to a Block
func (np *NewBlock) ToBlock() *Block {
	block := &Block{}
	block.ID = bson.NewObjectId()
	block.UserID = np.UserID
	block.BlockType = np.BlockType
	block.CSS = []*CSS{}
	block.ParentID = np.ParentID
	block.Index = np.Index
	block.Children = []string{}
	block.ProjectID = np.ProjectID
	block.Attributes = ""
	return block
}

//UpdateBlock updates Block
func (b *Block) UpdateBlock(updates *BlockUpdates) *Block {
	if updates.CSS != nil {
		b.CSS = updates.CSS
	}
	if len(updates.ParentID) > 0 {
		b.ParentID = updates.ParentID
	}
	if (updates.Attributes) != (b.Attributes) && (len(updates.Attributes) > 0) {
		b.Attributes = updates.Attributes
	}
	if updates.Children != nil {
		b.Children = updates.Children
	}
	if updates.Index > -1 {
		b.Index = updates.Index
	}
	return b
}
