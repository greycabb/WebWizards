package indexes

import "errors"

//ErrIDNotFound is used when the bson.ObjectId object cannot be found
var ErrIDNotFound = errors.New("error finding ObjectId")

//ErrKeyNotFound is used when the key cannot be found in a True struct
var ErrKeyNotFound = errors.New("error finding key in trie")
