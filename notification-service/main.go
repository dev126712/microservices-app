package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// Define the structure of the incoming request
type NotificationRequest struct {
	OrderID int    `json:"order_id"`
	Msg     string `json:"msg"`
}

func notifyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req NotificationRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Logic: In a real app, this would send an Email or SMS
	fmt.Printf(">>> [NOTIFY] Order #%d processed: %s\n", req.OrderID, req.Msg)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "Go Notification Sent"})
}

func main() {
	http.HandleFunc("/notify", notifyHandler)

	fmt.Println("Notification Service (Go) starting on port 5001...")
	if err := http.ListenAndServe(":5001", nil); err != nil {
		log.Fatal(err)
	}
}
