package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Malin502/homelab-status/internal/kubernetes"
	"github.com/Malin502/homelab-status/internal/handler"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func main() {
	client, err := kubernetes.NewClient()
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/api/nodes", func(w http.ResponseWriter, r *http.Request) {
		nodes, err := client.CoreV1().Nodes().List(r.Context(), metav1.ListOptions{})
		if err != nil {
			http.Error(w, "Failed to get nodes", http.StatusInternalServerError)
			return
		}

		type Node struct {
			Name  string `json:"name"`
			Ready bool   `json:"ready"`
		}

		response := struct {
			Nodes []Node `json:"nodes"`
		}{
			Nodes: []Node{},
		}

		for _, node := range nodes.Items {
			ready := false

			for _, condition := range node.Status.Conditions {
				if condition.Type == "Ready" {
					ready = condition.Status == "True"
					break
				}
			}

			response.Nodes = append(response.Nodes, Node{
				Name:  node.Name,
				Ready: ready,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Pod一覧APIを追加
	http.HandleFunc("/api/pods", handler.Pods(client))

	http.Handle("/", http.FileServer(http.Dir("./web")))

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}