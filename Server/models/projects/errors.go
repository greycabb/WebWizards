package projects

import "errors"

//ErrInsert is used when the Insert method in User Store the fails
var ErrInsert = errors.New("error inserting into database")

//ErrProjectNotFound is used when the project cannot be found
var ErrProjectNotFound = errors.New("error finding project")

//ErrNameLength is used when the name of the project is less than 3 characters
var ErrNameLength = errors.New("error name must be at least 3 characters")
