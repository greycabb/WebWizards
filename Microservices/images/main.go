package main

import (
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
	w.Header().Add("Access-Control-Allow-Origin", "*")
	url := r.URL.Query().Get("id")
	if len(url) == 0 {
		//Case where all image data should be returned
	} else {
		//Case where one image data is returned based on id query
		//json.NewEncoder(w).Encode(image)
		//request.Close()
	}
}
