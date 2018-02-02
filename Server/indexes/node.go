package indexes

import (
	"gopkg.in/mgo.v2/bson"
)

//Node structure that holds children nodes and a slice of bson.ObjectId objects
type Node struct {
	children  map[rune]*Node
	nodeValue []bson.ObjectId
}

//NewNode initializes a new node
func (n *Node) NewNode() *Node {
	return &Node{
		children: make(map[rune]*Node),
	}
}

//AddVal adds a bson.ObjectId to the node's slice of values
func (n *Node) AddVal(val bson.ObjectId) {
	n.nodeValue = append(n.nodeValue, val)
}

//RemoveVal removes a bson.ObjectId from the node's slice of values
func (n *Node) RemoveVal(val bson.ObjectId) error {
	s := n.nodeValue
	index := -1
	// Find index of our value
	for i, cur := range s {
		if cur == val {
			index = i
		}
	}
	if index != -1 {
		n.nodeValue = append(s[:index], s[index+1:]...)
	} else {
		return ErrIDNotFound
	}
	return nil
}
