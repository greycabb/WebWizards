package blocks

import "errors"

//ErrInsert is used when the Insert method in User Store the fails
var ErrInsert = errors.New("error inserting into database")

//ErrBlockNotFound is used when the block cannot be found
var ErrBlockNotFound = errors.New("error finding block")
