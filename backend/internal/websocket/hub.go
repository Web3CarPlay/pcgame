package websocket

import (
	"encoding/json"
	"sync"

	"github.com/gorilla/websocket"
)

// Message types
const (
	MsgTypeRoundUpdate  = "round_update"
	MsgTypeCountdown    = "countdown"
	MsgTypeResult       = "result"
	MsgTypeBetConfirmed = "bet_confirmed"
)

// Message represents a WebSocket message
type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// Client represents a connected WebSocket client
type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	userID uint
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// NewHub creates a new Hub instance
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast sends a message to all connected clients
func (h *Hub) Broadcast(msg Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	h.broadcast <- data
}

// BroadcastRoundUpdate sends round update to all clients
func (h *Hub) BroadcastRoundUpdate(roundData interface{}) {
	h.Broadcast(Message{
		Type:    MsgTypeRoundUpdate,
		Payload: roundData,
	})
}

// BroadcastCountdown sends countdown update to all clients
func (h *Hub) BroadcastCountdown(seconds int) {
	h.Broadcast(Message{
		Type:    MsgTypeCountdown,
		Payload: map[string]int{"seconds": seconds},
	})
}

// BroadcastResult sends result to all clients
func (h *Hub) BroadcastResult(result interface{}) {
	h.Broadcast(Message{
		Type:    MsgTypeResult,
		Payload: result,
	})
}

// NewClient creates a new client
func NewClient(hub *Hub, conn *websocket.Conn, userID uint) *Client {
	return &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
	}
}

// Register registers a client to the hub
func (h *Hub) Register(client *Client) {
	h.register <- client
}

// Unregister unregisters a client from the hub
func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

// WritePump pumps messages from the hub to the websocket connection
func (c *Client) WritePump() {
	defer func() {
		c.conn.Close()
	}()

	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			return
		}
	}
}

// ReadPump pumps messages from the websocket connection to the hub
func (c *Client) ReadPump() {
	defer func() {
		c.hub.Unregister(c)
		c.conn.Close()
	}()

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		// Handle incoming messages if needed
	}
}
