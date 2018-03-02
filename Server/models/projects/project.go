package projects

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

var bcryptCost = 13

//NewProject represents a user creating a new project
type NewProject struct {
	UserID  bson.ObjectId `json:"userid" bson:"_userid"`
	Content []*Block      `json:"content"`
	Created time.Time     `json:"created,string"`
}

//Project represents a project in the database
type Project struct {
	ProjectID bson.ObjectId `json:"projectid" bson:"_projectid"`
	UserID    bson.ObjectId `json:"userid" bson:"_userid"`
	Content   []*Block      `json:"content"`
	Created   time.Time     `json:"created,string"`
	Edited    time.Time     `json:"edited,string"`
}

//Block represents one html block
type Block struct {
	BlockType int      `json:"blocktype"`
	CSS       []*CSS   `json:"css"`
	Children  []*Block `json:"children"`
}

//CSS represents one css configuration
type CSS struct {
	Attribute string `json:"attribute"`
	Value     string `json:"value"`
}
