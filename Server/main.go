package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/go-redis/redis"
	"github.com/greycabb/WebWizards/Server/handlers"
	"github.com/greycabb/WebWizards/Server/models/blocks"
	"github.com/greycabb/WebWizards/Server/models/projects"
	"github.com/greycabb/WebWizards/Server/models/users"
	"github.com/greycabb/WebWizards/Server/sessions"
	mgo "gopkg.in/mgo.v2"
)

//NewServiceProxy creates a new service proxy
func NewServiceProxy(addrs []string) *httputil.ReverseProxy {
	nextIndex := 0
	mx := sync.Mutex{}
	return &httputil.ReverseProxy{
		Director: func(r *http.Request) {
			/*if ctx != nil {
				r.Header.Del("X-User")
				state := &handlers.SessionState{} //Initialize an empty state to populate
				_, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, state)
				if err != nil {
					log.Println(err.Error())
				} else {
					userJSON, err := json.Marshal(state.Authenticated)
					if err != nil {
						log.Println(err.Error())
					} else {
						r.Header.Add("X-User", string(userJSON))
					}
				}
			} */
			mx.Lock()
			r.URL.Host = addrs[nextIndex%len(addrs)]
			nextIndex++
			mx.Unlock()
			r.URL.Scheme = "http"
		},
	}
}

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
	projectStore := projects.NewMongoStore(mongoSess, "projectDB", "projects")
	blockStore := blocks.NewMongoStore(mongoSess, "blockDB", "blocks")
	trie, err := userStore.LoadUsersToTrie()
	if err != nil {
		log.Fatalf("error loading users to trie: %v", err)
	}
	defer mongoSess.Close()
	//Initalize new handle context struct
	sessionKey := os.Getenv("SESSIONKEY")
	ctx := handlers.NewHandlerContext(sessionKey, SessionStore, userStore, projectStore, blockStore, trie)
	//Initialize microservices addresses
	htmlsvcaddr := os.Getenv("HTMLSVCADDR")
	splitHTMLSvcAddrs := strings.Split(htmlsvcaddr, ",")
	imagesvcaddr := os.Getenv("IMAGEADDR")
	splitImagesSvcAddrs := strings.Split(imagesvcaddr, ",")
	//Initalize new mux
	mux := http.NewServeMux()
	//Handlers
	mux.HandleFunc("/v1/users", ctx.UsersHandler)
	mux.HandleFunc("/v1/users/me", ctx.UsersMeHandler)
	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/mine", ctx.SessionsMineHandler)
	mux.HandleFunc("/v1/blocks", ctx.BlocksHandler)
	mux.HandleFunc("/v1/projects", ctx.ProjectHandler)
	mux.HandleFunc("/v1/user/projects", ctx.UserProjectHandler)
	mux.Handle("/v1/htmlblocks", NewServiceProxy(splitHTMLSvcAddrs))
	mux.Handle("/v1/cssgroups", NewServiceProxy(splitHTMLSvcAddrs))
	mux.Handle("/v1/cssattributes", NewServiceProxy(splitHTMLSvcAddrs))
	mux.Handle("/v1/images", NewServiceProxy(splitImagesSvcAddrs))
	//Wrap mux with CORS middleware handler
	corsHandler := handlers.NewCORSHandler(mux)
	log.Printf("server is listening at %s...", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlscert, tlskey, corsHandler))
}
