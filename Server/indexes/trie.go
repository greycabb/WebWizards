package indexes

import (
	"sync"

	"gopkg.in/mgo.v2/bson"
)

//Trie is a structure that enables quick search retrieval
//The key stored is a string while the value stored is a bson.ObjectId
type Trie struct {
	Root *Node
	mx   sync.RWMutex
}

//NewTrie constructs a new Trie Object
func NewTrie() *Trie {
	trie := &Trie{
		Root: &Node{
			children: make(map[rune]*Node),
		},
	}
	return trie
}

//Set adds a key/value pair to the trie
//Multiple values may be stored for the same key, but they must be distinct values
func (t *Trie) Set(key string, value bson.ObjectId) {
	t.mx.Lock()
	cur := t.Root
	runes := []rune(key)
	for i := 0; i < len(runes); i++ {
		r := runes[i]
		child, ok := cur.children[r]
		//If no child node associated with rune r, create a new child node
		if !ok {
			child = cur.NewNode()
			cur.children[r] = child
		}
		cur = child
	}
	cur.AddVal(value)
	t.mx.Unlock()
}

//Get method returns the first n values that match a given prefix key
func (t *Trie) Get(prefix string, n int) []bson.ObjectId {
	t.mx.Lock()
	//Set default number of values to return if invalid number provided
	if n < 1 {
		n = 15
	}
	var results []bson.ObjectId
	cur := t.Root
	runes := []rune(prefix)
	defer t.mx.Unlock()
	for i := 0; i < len(runes); i++ {
		r := runes[i]
		child, ok := cur.children[r]
		//If no child node associated with rune r, return empty list
		if !ok {
			return results
		}
		cur = child
	}
	return ExploreBranch(cur, results, n)
}

//ExploreBranch performs a recursive depth-first search to find maxLen values from Node
func ExploreBranch(n *Node, results []bson.ObjectId, maxLen int) []bson.ObjectId {
	//If there are children in this node and we haven't hit the max # of results
	results = append(results, n.nodeValue...)
	if len(n.children) != 0 && len(results) < maxLen {
		for _, child := range n.children {
			if len(results) > maxLen {
				results = results[:maxLen]
				break
			}
			results = ExploreBranch(child, results, maxLen)
		}
	}
	return results
}

//Remove deletes the given key and value pair from the trie
func (t *Trie) Remove(key string, val bson.ObjectId) error {
	t.mx.Lock()
	cur := t.Root
	runes := []rune(key)
	defer t.mx.Unlock()
	for i := 0; i < len(runes); i++ {
		r := runes[i]
		child, ok := cur.children[r]
		//If no child node associated with rune r, return error
		if !ok {
			return ErrKeyNotFound
		}
		cur = child
	}
	err := cur.RemoveVal(val)
	return err
}
