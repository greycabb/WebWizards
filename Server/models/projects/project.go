package projects

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

//var bcryptCost = 13

//NewProject represents a user creating a new project
type NewProject struct {
	UserID  string    `json:"userid"`
	Name    string    `json:"Name"`
	Content []*string `json:"content"`
}

//Project represents a project in the database
type Project struct {
	ID      bson.ObjectId `json:"id" bson:"_id"`
	UserID  string        `json:"userid"`
	Name    string        `json:"Name"`
	Content []*string     `json:"content"`
	Created time.Time     `json:"created,string"`
	Edited  time.Time     `json:"edited,string"`
}

//ProjectUpdates represents possible project updates
type ProjectUpdates struct {
	Name    string    `json:"Name"`
	Content []*string `json:"content"`
	Edited  time.Time `json:"edited,string"`
}

//ToProject converts the NewProject to a Project
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
