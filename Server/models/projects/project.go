package projects

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

//var bcryptCost = 13

//NewProject represents a user creating a new project
type NewProject struct {
	UserID  bson.ObjectId `json:"userid"`
	Name    string        `json:"name"`
	Content []string      `json:"content"`
}

//Project represents a project in the database
type Project struct {
	ID      bson.ObjectId `json:"id" bson:"_id"`
	UserID  bson.ObjectId `json:"userid"`
	Name    string        `json:"name"`
	Content []string      `json:"content"`
	Created time.Time     `json:"created,string"`
	Edited  time.Time     `json:"edited,string"`
}

//ProjectUpdates represents possible project updates
type ProjectUpdates struct {
	Name    string    `json:"name"`
	Content []string  `json:"content"`
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
func (p *Project) ApplyProjectUpdates(updates *ProjectUpdates) (*Project, error) {
	//Need to add error handling
	if len(p.Name) > 2 {
		p.Name = updates.Name
	} else {
		return nil, ErrNameLength
	}
	if len(updates.Content) > 0 {
		p.Content = updates.Content
	}
	p.Edited = time.Now()
	return p, nil
}
