package projects

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

var bcryptCost = 13

//NewProject represents a user creating a new project
type NewProject struct {
	UserID  string   `json:"userid"`
	Name    string   `json:"Name"`
	Content []*Block `json:"content"`
}

//Project represents a project in the database
type Project struct {
	ID      bson.ObjectId `json:"id" bson:"_id"`
	UserID  string        `json:"userid"`
	Name    string        `json:"Name"`
	Content []*Block      `json:"content"`
	Created time.Time     `json:"created,string"`
	Edited  time.Time     `json:"edited,string"`
}

//Block represents one html block in the database
type Block struct {
	ID        string   `json:"blockid"`
	BlockType int      `json:"blocktype"`
	CSS       []*CSS   `json:"css"`
	ParentID  string   `json:"parentid"`
	Children  []*Block `json:"children"`
}

//CSS represents one css configuration
type CSS struct {
	Attribute string `json:"attribute"`
	Value     string `json:"value"`
}

//ProjectUpdates represents possible project updates
type ProjectUpdates struct {
	Name    string    `json:"Name"`
	Content []*Block  `json:"content"`
	Edited  time.Time `json:"edited,string"`
}

//BlockUpdates represents possible updates to a block
type BlockUpdates struct {
	CSS      []*CSS   `json:"css"`
	ParentID string   `json:"parentid"`
	Children []*Block `json:"children"`
}

//ToProject converts the NewUser to a User, setting the passHash fields appropriately
func (np *NewProject) ToProject() *Project {
	project := &Project{}
	project.ID = bson.NewObjectId()
	project.Name = np.Name
	project.UserID = np.UserID
	project.Created = time.Now()
	project.Edited = time.Now()
	return project
}

//ApplyProjectUpdates applies the updates to the project
func (p *Project) ApplyProjectUpdates(updates *ProjectUpdates) {
	//Need to add error handling
	p.Name = updates.Name
	p.Content = updates.Content
	p.Edited = time.Now()
}

//ApplyBlockUpdates applies the updates to the block.
func (b *Block) ApplyBlockUpdates(updates *BlockUpdates) {
	if len(updates.CSS) > 0 {
		b.CSS = updates.CSS
	}
	if len(updates.ParentID) > 0 {
		b.ParentID = updates.ParentID
	}
	if len(updates.Children) > 0 {
		b.Children = updates.Children
	}
}

//FindAndUpdateBlock looks for a blockid in an array of block structs and
//updates or returns an error
func FindAndUpdateBlock(arr []*Block, blockid string, updates *BlockUpdates) error {
	for i, block := range arr {
		b, found, _ := block.TraverseBlockArray(blockid, i)
		if found {
			b.ApplyBlockUpdates(updates)
			return nil
		}
	}
	return ErrBlockNotFound
}

//FindParentAndInsertBlock looks for a parentid in an array of block structs and
//inserts new block as child or returns an error
func FindParentAndInsertBlock(arr []*Block, parentid string, newblock *Block) error {
	for i, block := range arr {
		b, found, _ := block.TraverseBlockArray(parentid, i)
		if found {
			b.Children = append(b.Children, newblock)
			return nil
		}
	}
	return ErrBlockNotFound
}

//FindAndDeleteBlock deletes a block from its parent
func FindAndDeleteBlock(arr []*Block, blockid string) {
	//First get the parent id and child's index
	var parentID string
	var childIndex int
	for i, block := range arr {
		b, found, index := block.TraverseBlockArray(blockid, i)
		if found {
			parentID = b.ParentID
			childIndex = index
			break
		}
	}
	//Grab parent's child array
	var parent *Block
	for i, block := range arr {
		b, found, _ := block.TraverseBlockArray(parentID, i)
		if found {
			parent = b
			break
		}
	}
	parent.Children = remove(parent.Children, childIndex)
}

//TraverseBlockArray looks for a block id and returns it when found
func (b *Block) TraverseBlockArray(blockid string, curindex int) (*Block, bool, int) {
	result, status, index := b, false, -1
	if b.ID == blockid {
		return b, true, curindex
	}
	//for every child block, traverse and check to see if id matches
	for i, child := range b.Children {
		b2, found, index2 := child.TraverseBlockArray(blockid, i)
		if found {
			result = b2
			found = true
			index = index2
			break
		}
	}
	return result, status, index
}

func remove(slice []*Block, s int) []*Block {
	return append(slice[:s], slice[s+1:]...)
}
