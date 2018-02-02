package users

import "errors"

//ErrInvalidEmail is used when the email address is invalid
var ErrInvalidEmail = errors.New("invalid email address")

//ErrPasswordLen is used when the password is less than 6 characters long
var ErrPasswordLen = errors.New("password must be at least 6 characters")

//ErrPasswordMatch is used when the password confirmation does not match the password
var ErrPasswordMatch = errors.New("passwords do not match")

//ErrSettingPass is used when the user cannot be found
var ErrSettingPass = errors.New("error settings password")

//ErrUsernameLen is used when the username is 0 characters long
var ErrUsernameLen = errors.New("username must be at least 1 character")

//ErrFirstNameLen is used when the first name is 0 characters long
var ErrFirstNameLen = errors.New("first name must contain at least 1 character")

//ErrLastNameLen is used when the last name is 0 characters long
var ErrLastNameLen = errors.New("last name must contain at least 1 character")

//ErrInsert is used when the Insert method in User Store the fails
var ErrInsert = errors.New("error inserting into database")

//ErrUpdating is used when there is an issue with updating User information
var ErrUpdating = errors.New("error updating user information")

//ErrMarshalling is used when marshalling fails
var ErrMarshalling = errors.New("error marshalling")

//ErrUnmarshalling is used when unmarshalling fails
var ErrUnmarshalling = errors.New("error unmarshalling")
