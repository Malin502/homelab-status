package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/api/nodes", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		response := map[string]any{
			"nodes": []map[string]any{
				{
					"name":  "pi4",
					"ready": true,
				},
			},
		}

		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Println(err)
		}
	})

	http.Handle("/", http.FileServer(http.Dir("./web")))

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}