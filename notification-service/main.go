package main // <--- This line MUST be the first line

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
	http.HandleFunc("/notify", notifyHandler)

	fmt.Println("Notification Service (Go) starting on port 5001...")
	if err := http.ListenAndServe(":5001", nil); err != nil {
		log.Fatal(err)
	}
}
