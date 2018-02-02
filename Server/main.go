package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/greycabb/WebWizards/server/handlers"
	"github.com/greycabb/WebWizards/server/sessions"
	"github.com/greycabb/WebWizards/server/models/users"
	"github.com/go-redis/redis"
	mgo "gopkg.in/mgo.v2"
)

//main is the main entry point for the server
func main() {
	addr := os.Getenv("ADDR")
	if len(addr) == 0 {
		addr = ":443"
	}
	tlskey := os.Getenv("TLSKEY")
	tlscert := os.Getenv("TLSCERT")
	if len(tlskey) == 0 || len(tlscert) == 0 {
		log.Fatal("please set TLSKEY and TLSCERT")
	}
	//Initialize new redis Client
	redisAddr := os.Getenv("REDISADDR")
	if len(redisAddr) == 0 {
		redisAddr = "localhost:6379"
	}
	client := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})
	SessionStore := sessions.NewRedisStore(client, time.Hour)
	//Dial and initialize MongoDB server
	dbAddr := os.Getenv("DBADDR")
	if len(dbAddr) == 0 {
		dbAddr = "localhost:27017"
	}
	mongoSess, err := mgo.Dial(dbAddr)
	if err != nil {
		log.Fatalf("error dialing mongo: %v", err)
	}
	userStore := users.NewMongoStore(mongoSess, "userDB", "users")
	trie, err := userStore.LoadUsersToTrie()
	if err != nil {
		log.Fatalf("error loading users to trie: %v", err)
	}
	defer mongoSess.Close()
	//Initalize new handle context struct
	sessionKey := os.Getenv("SESSIONKEY")
	ctx := handlers.NewHandlerContext(sessionKey, SessionStore, userStore, trie)
	//Initalize new mux
	mux := http.NewServeMux()
	//Handlers
	mux.HandleFunc("/v1/users", ctx.UsersHandler)
	mux.HandleFunc("/v1/users/me", ctx.UsersMeHandler)
	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/mine", ctx.SessionsMineHandler)
	//Wrap mux with CORS middleware handler
	corsHandler := handlers.NewCORSHandler(mux)
	log.Printf("server is listening at %s...", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlscert, tlskey, corsHandler))
}
