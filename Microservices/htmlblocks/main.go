package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
)

//HTMLBlock defines structure of an HTML element block
type HTMLBlock struct {
	ID          int      `json:"id"`
	Name        string   `json:"name"`
	Translation string   `json:"translation"`
	Description string   `json:"description"`
	Type        string   `json:"type"`
	CSSGroups   []string `json:"css_groups"`
}

//CSSGroup defines a group of CSS attributes
type CSSGroup struct {
	Name        string   `json:"name"`
	Translation string   `json:"translation"`
	Description string   `json:"description"`
	Attrbutes   []string `json:"attributes"`
}

func main() {
	addr := os.Getenv("HTMLADDR")
	if len(addr) == 0 {
		addr = ":80"
	}

	http.HandleFunc("/v1/htmlblocks", HTMLHandler)
	http.HandleFunc("/v1/cssgroups", CSSGroupsHandler)
	http.HandleFunc("/v1/cssattributes", CSSHandler)
	log.Printf("htmlblocks server is listening at http://%s...", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

//HTMLHandler handles requests for the html block API
//This API expects none or one query string parameter named `id`,
//which should contain an HTML block's id. It responds with
//a JSON-encoded HTML block struct.
//Without the `id` query, all HTML block information will be returned
func HTMLHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	query := r.URL.Query().Get("id")
	jsonFile, err := ioutil.ReadFile("./htmldata.json")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Print(jsonFile)
	var c []HTMLBlock
	json.Unmarshal(jsonFile, &c)
	if len(query) == 0 {
		//Case where all HTML block data should be returned
		respond(w, c)
	} else {
		id, err := strconv.Atoi(query)
		if err != nil {
			// handle error
			fmt.Println(err)
		}
		respond(w, c[id])
	}
}

//CSSGroupsHandler handles requests for css groups
//Returns all available groups
func CSSGroupsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	jsonFile, err := ioutil.ReadFile("./cssgroupdata.json")
	if err != nil {
		fmt.Println(err)
	}
	var c []CSSGroup
	json.Unmarshal(jsonFile, &c)
	respond(w, c)
}

//CSSHandler handles requests for css attributes
//requires css name as query
func CSSHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	query := r.URL.Query().Get("attr")
	jsonFile, err := os.Open("./cssattributes.json")
	if err != nil {
		fmt.Println(err)
	}
	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		fmt.Println(err)
	}
	var objmap map[string]*json.RawMessage
	err = json.Unmarshal(byteValue, &objmap)
	if err != nil {
		fmt.Println(err)
	}
	respond(w, objmap[query])
}
