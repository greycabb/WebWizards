package handlers

import (
	"github.com/greycabb/WebWizards/Server/models/blocks"
	"github.com/greycabb/WebWizards/Server/models/projects"
	"github.com/greycabb/WebWizards/server/indexes"
	"github.com/greycabb/WebWizards/server/models/users"
	"github.com/greycabb/WebWizards/server/sessions"
)

//HandlerContext provides access to globals such as the key,
//session store, and user store
type HandlerContext struct {
	SigningKey   string
	SessionStore sessions.Store
	usersStore   users.Store
	projectStore projects.Store
	blockStore   blocks.Store
	trie         *indexes.Trie
}

//NewHandlerContext constructs a new HandlerContext
func NewHandlerContext(SigningKey string, SessionStore sessions.Store,
	usersStore users.Store, projectStore projects.Store, blockStore blocks.Store, trie *indexes.Trie) *HandlerContext {
	return &HandlerContext{
		SigningKey:   SigningKey,
		SessionStore: SessionStore,
		usersStore:   usersStore,
		projectStore: projectStore,
		blockStore:   blockStore,
		trie:         trie,
	}
}
