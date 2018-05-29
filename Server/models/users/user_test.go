package users

import (
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

// Test that PassHash is correctly set from the NewUser structure to User structure
func TestToUser(t *testing.T) {
	//Testing for correctly calculated PhotoURL
	testUser.Email = " genuine.mel@gmail.com   "
	testUser.Email = " gEnuIne.Mel@Gmail.cOm   "
	user3, _ := testUser.ToUser()
	//Testing for correct PassHash setting
	err := bcrypt.CompareHashAndPassword(user3.PassHash, []byte(testUser.Password))
	if err != nil {
		t.Errorf("error hashing password")
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
