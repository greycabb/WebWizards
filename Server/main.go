package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"os"
	"strings"
	"sync"
	"time"

	//"github.com/info344-a17/challenges-leemeli/servers/gateway/handlers"
	"github.com/streadway/amqp"
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
	//Initalize new mux
	mux := http.NewServeMux()
	//Handlers
	/*mux.HandleFunc("/v1/users", ctx.UsersHandler)
	mux.HandleFunc("/v1/users/me", ctx.UsersMeHandler)
	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/mine", ctx.SessionsMineHandler)
	mux.Handle("/v1/ws", handlers.NewWebSocketsHandler(notifier, ctx.SessionStore, ctx.SigningKey))
	//Microservice handlers
	mux.Handle("/v1/summary", NewServiceProxy(splitSummarySvcAddrs, nil))
	mux.Handle("/v1/channels", NewServiceProxy(splitMessageSvcAddrs, ctx))
	mux.Handle("/v1/channels/", NewServiceProxy(splitMessageSvcAddrs, ctx))
	mux.Handle("/v1/messages/", NewServiceProxy(splitMessageSvcAddrs, ctx)) */
	//Wrap mux with CORS middleware handler
	corsHandler := handlers.NewCORSHandler(mux)
	log.Printf("server is listening at %s...", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlscert, tlskey, corsHandler))
}
