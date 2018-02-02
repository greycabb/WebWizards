package indexes

import (
	"testing"

	"gopkg.in/mgo.v2/bson"
)

//Tests for Trie data structure
func TestTrie(t *testing.T) {
	trie := NewTrie()
	testID := bson.NewObjectId()
	//Testing Set and Get methods
	trie.Set("fakeemail@gmail.com", testID)
	trie.Set("fakeName", testID)
	trie.Set("anotherFake", testID)
	trie.Set("fakeUser", testID)
	trie.Set("汉字", testID)
	results := trie.Get("fake", 4)
	if len(results) != 3 {
		t.Errorf("expected to get 3 values, got %d", len(results))
	}
	results = trie.Get("nothing", 10)
	if len(results) != 0 {
		t.Errorf("expected to get 0 values, got %d", len(results))
	}
	results = trie.Get("汉", 1)
	if len(results) != 1 {
		t.Errorf("expected to get 1 value, got %d", len(results))
	}
	//Testing Remove method
	err := trie.Remove("anotherFake", testID)
	if err != nil {
		t.Errorf("unexpected err: %v", err)
	}
	results = trie.Get("anotherFake", 1)
	if len(results) != 0 {
		t.Errorf("expected to get 0 values, got %d", len(results))
	}
	err = trie.Remove("notFoundUser123", testID)
	if err != ErrKeyNotFound {
		t.Errorf("expected error: %v; got error: %v", ErrKeyNotFound, err)
	}
	err = trie.Remove("fakeUser", bson.NewObjectId())
	if err != ErrIDNotFound {
		t.Errorf("expected error: %v; got error: %v", ErrIDNotFound, err)
	}
}
