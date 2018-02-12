package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	addr := os.Getenv("CSSADDR")
	if len(addr) == 0 {
		addr = ":80"
	}

	http.HandleFunc("/v1/cssattr", Handler)
	log.Printf("cssattr server is listening at http://%s...", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

//Handler handles requests for the css attribute API
//This API expects one query string parameter named `id`,
//which should contain an css attribute's id. It responds with
//a JSON-encoded CSS attribute struct
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	url := r.URL.Query().Get("id")
	if len(url) == 0 {
		http.Error(w, "Please provide a correct URL", http.StatusBadRequest)
		return
	}
	//Case where one HTML block data is returned based on id query
	//json.NewEncoder(w).Encode(cssattr)
	//request.Close()
}
