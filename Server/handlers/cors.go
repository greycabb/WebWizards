package handlers

import "net/http"

//CORSHandler struct that contains a http.Handler
type CORSHandler struct {
	Handler http.Handler
}

//ServeHTTP sets various CORS response headers
func (ch *CORSHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Add("Access-Control-Expose-Headers", "Authorization")
	w.Header().Add("Access-Control-Max-Age", "600")
	w.Header().Set(headerContentType, contentTypeJSON)

	if r.Method != "OPTIONS" {
		ch.Handler.ServeHTTP(w, r)
	}
}

//NewCORSHandler returns a new CORSHandler
func NewCORSHandler(handlerToWrap http.Handler) *CORSHandler {
	return &CORSHandler{handlerToWrap}
}
