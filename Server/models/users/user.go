package users

import (
	"net/mail"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2/bson"
)

var bcryptCost = 13

//User represents a user account in the database
type User struct {
	ID         bson.ObjectId `json:"id" bson:"_id"`
	Email      string        `json:"email"`
	PassHash   []byte        `json:"-"` //stored, but not encoded to clients
	UserName   string        `json:"userName"`
	FirstName  string        `json:"firstName"`
	LastName   string        `json:"lastName"`
	DateJoined time.Time     `json:"dateJoined,string"`
}

//Credentials represents user sign-in credentials
type Credentials struct {
	UserName string `json:"userName"`
	Password string `json:"password"`
}

//NewUser represents a new user signing up for an account
type NewUser struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
	UserName     string `json:"userName"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
}

//Updates represents allowed updates to a user profile
type Updates struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

//Validate validates the new user and returns an error if
//any of the validation rules fail, or nil if its valid
func (nu *NewUser) Validate() error {
	if len(nu.Email) > 0 {
		_, err := mail.ParseAddress(nu.Email)
		if err != nil {
			return ErrInvalidEmail
		}
	}
	if len(nu.Password) < 6 {
		return ErrPasswordLen
	}
	if nu.Password != nu.PasswordConf {
		return ErrPasswordMatch
	}
	if len(nu.UserName) == 0 {
		return ErrUsernameLen
	}
	return nil
}

//ToUser converts the NewUser to a User, setting the passHash fields appropriately
func (nu *NewUser) ToUser() (*User, error) {
	user := &User{}
	user.ID = bson.NewObjectId()
	user.Email = strings.TrimSpace(strings.ToLower(nu.Email))
	user.UserName = strings.ToLower(nu.UserName)
	user.FirstName = nu.FirstName
	user.LastName = nu.LastName
	//Setting User Structure's PassHash field
	err := user.SetPassword(nu.Password)
	//Setting User Structure's Time field
	user.DateJoined = time.Now()
	return user, err
}

//FullName returns the user's full name, in the form:
// "<FirstName> <LastName>"
//If either first or last name is an empty string, no
//space is put betweeen the names
func (u *User) FullName() string {
	name := u.FirstName + " " + u.LastName
	name = strings.TrimSpace(name)
	return name
}

//SetPassword hashes the password and stores it in the PassHash field
func (u *User) SetPassword(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return ErrSettingPass
	}
	u.PassHash = hash
	return nil
}

//Authenticate compares the plaintext password against the stored hash
//and returns an error if they don't match, or nil if they do
func (u *User) Authenticate(password string) error {
	err := bcrypt.CompareHashAndPassword(u.PassHash, []byte(password))
	if err != nil {
		return err
	}
	return nil
}

//ApplyUpdates applies the updates to the user. An error
//is returned if the updates are invalid
func (u *User) ApplyUpdates(updates *Updates) error {
	if len(updates.FirstName) == 0 {
		return ErrFirstNameLen
	}
	if len(updates.LastName) == 0 {
		return ErrLastNameLen
	}
	u.FirstName = updates.FirstName
	u.LastName = updates.LastName
	return nil
}
