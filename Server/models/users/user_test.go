package users

import (
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

// TestValidate tests the Validate method to make sure all necessary errors are thrown
func TestValidate(t *testing.T) {
	cases := []struct {
		name  string
		input NewUser
		err   error
	}{
		{
			"Valid New User",
			NewUser{
				"leemeli@uw.edu",
				"password",
				"password",
				"leemeli",
				"Melody",
				"Lee",
			},
			nil,
		},
		{
			"Invalid Email",
			NewUser{
				"leemeliuw.edu",
				"password",
				"password",
				"leemeli",
				"Melody",
				"Lee",
			},
			ErrInvalidEmail,
		},
		{
			"Passwords must be 6 characters",
			NewUser{
				"leemeli@uw.edu",
				"pass",
				"pass",
				"leemeli",
				"Melody",
				"Lee",
			},
			ErrPasswordLen,
		},
		{
			"Passwords do not match",
			NewUser{
				"leemeli@uw.edu",
				"password",
				"password2",
				"leemeli",
				"Melody",
				"Lee",
			},
			ErrPasswordMatch,
		},
		{
			"Username is 0 characters",
			NewUser{
				"leemeli@uw.edu",
				"password",
				"password",
				"",
				"Melody",
				"Lee",
			},
			ErrUsernameLen,
		},
	}
	for _, c := range cases {
		output := c.input.Validate()
		if output != c.err {
			t.Errorf("%s: got %v but expected %v", c.name, output, c.err)
		}
	}
}

// NewUser structure defined for testing purposes
var testUser = &NewUser{
	"genuine.mel@gmail.com",
	"password",
	"password",
	"leemeli",
	"Melody",
	"Lee",
}

// Test that PhotoURL and PassHash are correctly set from the NewUser structure to User structure
func TestToUser(t *testing.T) {
	//Testing for correctly calculated PhotoURL
	user, _ := testUser.ToUser()
	testUser.Email = " genuine.mel@gmail.com   "
	user2, _ := testUser.ToUser()
	if strings.Compare(user2.PhotoURL, testPhotoURL) != 0 {
		t.Errorf("error hashing email, expected %s but got %s", testPhotoURL, user.PhotoURL)
	}
	testUser.Email = " gEnuIne.Mel@Gmail.cOm   "
	user3, _ := testUser.ToUser()
	if strings.Compare(user3.PhotoURL, testPhotoURL) != 0 {
		t.Errorf("error hashing email, expected %s but got %s", testPhotoURL, user.PhotoURL)
	}
	//Testing for correct PassHash setting
	err := bcrypt.CompareHashAndPassword(user3.PassHash, []byte(testUser.Password))
	if err != nil {
		t.Errorf("error hashing password")
	}
}

// Test that the FullName method returns a correct string that concats the First and Last Name
// with a space. If only one of First and Last Name are provided, there should be no spaces and
// only the one name should be returned. If both fields are empty, an empty string results.
func TestFullName(t *testing.T) {
	cases := []struct {
		name     string
		input    User
		expected string
	}{
		{
			"First and Last Name Set",
			User{
				FirstName: "Melody",
				LastName:  "Lee",
			},
			"Melody Lee",
		},
		{
			"First Name Only",
			User{
				FirstName: "Melody",
				LastName:  "",
			},
			"Melody",
		},
		{
			"Last Name Only",
			User{
				FirstName: "",
				LastName:  "Lee",
			},
			"Lee",
		},
		{
			"No First or Last Name",
			User{},
			"",
		},
	}
	for _, c := range cases {
		output := c.input.FullName()
		if output != c.expected {
			t.Errorf("%s: got %s but expected %s", c.name, output, c.expected)
		}
	}
}

//Test that Authenticate works properly for incorrect and correct passwords
func TestAuthenticate(t *testing.T) {
	user, _ := testUser.ToUser()
	//Correct password
	err := user.Authenticate("password")
	if err != nil {
		t.Errorf("authentication failed, expected to pass")
	}
	//Incorrect password
	err2 := user.Authenticate("incorrect")
	if err2 == nil {
		t.Errorf("authentication passed, expected to fail")
	}
}

// Test  for updates being applied properly to the User Structure
func TestApplyUpdates(t *testing.T) {
	user, _ := testUser.ToUser()
	cases := []struct {
		name  string
		input Updates
		err   error
	}{
		{
			"First and last name update",
			Updates{
				FirstName: "Haha",
				LastName:  "Hoo",
			},
			nil,
		},
		{
			"Last name is empty",
			Updates{
				FirstName: "Moo",
				LastName:  "",
			},
			ErrLastNameLen,
		},
		{
			"First name is empty",
			Updates{
				FirstName: "",
				LastName:  "Foo",
			},
			ErrFirstNameLen,
		},
		{
			"No First or Last Name",
			Updates{},
			ErrFirstNameLen,
		},
	}
	for _, c := range cases {
		output := user.ApplyUpdates(&c.input)
		if output != c.err {
			t.Errorf("errors for applying updates are incorrect, expected %v got %v", c.err, output)
		}
		if output == nil && user.FirstName != c.input.FirstName && user.LastName != c.input.LastName {
			t.Errorf("error: user structure is not updating")
		}
	}
}
