package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

func main() {
	addr := os.Getenv("IMGADDR")
	if len(addr) == 0 {
		addr = ":80"
	}

	http.HandleFunc("/v1/images", Handler)
	log.Printf("images server is listening at http://%s...", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

//Handler handles requests for the image API
//This API expects none or one query string parameter named `id`,
//which should contain an image's id. It responds with
//a JSON-encoded image struct.
//Without the `id` query, all image information will be returned
func Handler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("cat")
	if len(query) == 0 {
		//Case where all image data should be returned
		jsonFile, err := os.Open("./images.json")
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
		respond(w, objmap)
	} else {
		jsonFile, err := os.Open("./images.json")
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
}
