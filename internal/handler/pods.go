package handler

import (
	"encoding/json"
	"net/http"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Pod struct {
	NodeName  string `json:"nodeName"`
	Namespace string `json:"namespace"`
	Name      string `json:"name"`
	Status    string `json:"status"`
}

func Pods(client kubernetes.Interface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		pods, err := client.CoreV1().Pods("").List(
			r.Context(),
			metav1.ListOptions{},
		)
		if err != nil {
			http.Error(w, "Failed to get pods", http.StatusInternalServerError)
			return
		}

		response := struct {
			Pods []Pod `json:"pods"`
		}{
			Pods: []Pod{},
		}

		for _, pod := range pods.Items {
			response.Pods = append(response.Pods, Pod{
				NodeName:  pod.Spec.NodeName,
				Namespace: pod.Namespace,
				Name:      pod.Name,
				Status:    string(pod.Status.Phase),
			})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			return
		}
	}
}