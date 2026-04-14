package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type NotificationRequest struct {
	OrderID     int    `json:"order_id"`
	ProductName string `json:"product_name"`
	Msg         string `json:"msg"`
}

// Health check handler
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func notifyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid method", 405)
		return
	}

	var req NotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", 400)
		return
	}

	fmt.Printf("\n--- [INCOMING NOTIFICATION] ---\n")
	fmt.Printf("Order #%d | Item: %s\n", req.OrderID, req.ProductName)
	fmt.Printf("Status: %s\n", req.Msg)
	fmt.Printf("-------------------------------\n")

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "processed"})
}

func main() {
	// Endpoints
	http.HandleFunc("/notify", notifyHandler)
	http.HandleFunc("/health", healthHandler) // Added this

	fmt.Println("Notification Service (Go) starting on port 5001...")
	if err := http.ListenAndServe(":5001", nil); err != nil {
		log.Fatal(err)
	}
}
