package sessions

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
)

//InvalidSessionID represents an empty, invalid session ID
const InvalidSessionID SessionID = ""

//idLength is the length of the ID portion
const idLength = 32

//signedLength is the full length of the signed session ID
//(ID portion plus signature)
const signedLength = idLength + sha256.Size

//SessionID represents a valid, digitally-signed session ID.
//This is a base64 URL encoded string created from a byte slice
//where the first `idLength` bytes are crytographically random
//bytes representing the unique session ID, and the remaining bytes
//are an HMAC hash of those ID bytes (i.e., a digital signature).
//The byte slice layout is like so:
//+-----------------------------------------------------+
//|...32 crypto random bytes...|HMAC hash of those bytes|
//+-----------------------------------------------------+
type SessionID string

//ErrInvalidID is returned when an invalid session id is passed to ValidateID()
var ErrInvalidID = errors.New("Invalid Session ID")

//NewSessionID creates and returns a new digitally-signed session ID,
//using `SigningKey` as the HMAC signing key. An error is returned only
//if there was an error generating random bytes for the session ID
func NewSessionID(SigningKey string) (SessionID, error) {
	if len(SigningKey) == 0 {
		return InvalidSessionID, fmt.Errorf("SigningKey may not be empty")
	}
	random, err := GenerateRandomBytes(idLength)
	if err != nil {
		return InvalidSessionID, fmt.Errorf("Error generating bytes: %v", err)
	}
	key := []byte(SigningKey)
	h := hmac.New(sha256.New, key)
	h.Write(random)
	signature := h.Sum(nil)
	combinedBytes := append(random, signature...)
	var newID = SessionID(base64.URLEncoding.EncodeToString(combinedBytes))
	return newID, nil
}

//ValidateID validates the string in the `id` parameter
//using the `SigningKey` as the HMAC signing key
//and returns an error if invalid, or a SessionID if valid
func ValidateID(id string, SigningKey string) (SessionID, error) {
	decodedID, err := base64.URLEncoding.DecodeString(id)
	if err != nil {
		return InvalidSessionID, fmt.Errorf("Error base64-decoding: %v", err)
	}
	key := []byte(SigningKey)
	h := hmac.New(sha256.New, key)
	random := decodedID[:32] // The 32 random crypto bytes
	h.Write(random)
	signature := h.Sum(nil)
	if subtle.ConstantTimeCompare(decodedID[32:], signature) == 1 {
		return SessionID(id), nil
	}
	return InvalidSessionID, ErrInvalidID
}

// GenerateRandomBytes returns securely generated random bytes.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
// Method from: https://stackoverflow.com/questions/32349807/how-can-i-generate-a-random-int-using-the-crypto-rand-package
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}
	return b, nil
}

//String returns a string representation of the sessionID
func (sid SessionID) String() string {
	return string(sid)
}
