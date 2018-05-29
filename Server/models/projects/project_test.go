package projects

import (
	"testing"
)

// NewProject structure defined for testing purposes
var testProject = &NewProject{
	"aprojectid",
	"Project Name",
	[]string{},
	"n",
}

// Test that NewProject is correctly put into Project structure
func TestToProject(t *testing.T) {
	proj := testProject.ToProject()
	if proj.UserID != testProject.UserID || proj.Name != testProject.Name || proj.Private != testProject.Private {
		t.Errorf("project creation failed")
	}
}
