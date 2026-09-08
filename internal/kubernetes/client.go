package kubernetes

import (
	"fmt"
	"os"
	"path/filepath"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

func NewClient() (*kubernetes.Clientset, error) {
	// クラスタ内ではServiceAccountを使用
	config, err := rest.InClusterConfig()
	if err != nil {
		// ローカル開発ではkubeconfigを使用
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}

		kubeconfig := filepath.Join(home, ".kube", "config")
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, fmt.Errorf("kubeconfigの読み込みに失敗: %w", err)
		}
	}

	return kubernetes.NewForConfig(config)
}