package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	addr := os.Getenv("HTMLADDR")
	if len(addr) == 0 {
		addr = ":80"
	}

	http.HandleFunc("/v1/htmlblocks", Handler)
	log.Printf("htmlblocks server is listening at http://%s...", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

//Handler handles requests for the html block API
//This API expects none or one query string parameter named `id`,
//which should contain an HTML block's id. It responds with
//a JSON-encoded HTML block struct.
//Without the `id` query, all HTML block information will be returned
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	url := r.URL.Query().Get("id")
	if len(url) == 0 {
		//Case where all HTML block data should be returned
	} else {
		//Case where one HTML block data is returned based on id query
		//json.NewEncoder(w).Encode(htmlBlock)
		//request.Close()
	}
}
