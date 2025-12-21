import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { verify } from "jsonwebtoken";
import { ENV } from "./env";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

const clients = new Map<number, Set<AuthenticatedWebSocket>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: "/ws"
  });

  // Heartbeat to detect broken connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  wss.on("connection", (ws: AuthenticatedWebSocket, req) => {
    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle authentication
        if (message.type === "auth") {
          const token = message.token;
          if (!token) {
            ws.send(JSON.stringify({ type: "error", message: "No token provided" }));
            ws.close();
            return;
          }

          try {
            const decoded = verify(token, ENV.cookieSecret) as { userId: number };
            ws.userId = decoded.userId;

            // Add to clients map
            if (!clients.has(decoded.userId)) {
              clients.set(decoded.userId, new Set());
            }
            clients.get(decoded.userId)!.add(ws);

            ws.send(JSON.stringify({ type: "auth_success", userId: decoded.userId }));
            console.log(`[WebSocket] User ${decoded.userId} connected`);
          } catch (error) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
            ws.close();
          }
        }

        // Handle ping
        if (message.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("[WebSocket] Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        const userClients = clients.get(ws.userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            clients.delete(ws.userId);
          }
        }
        console.log(`[WebSocket] User ${ws.userId} disconnected`);
      }
    });

    ws.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
    });
  });

  console.log("[WebSocket] Server initialized on /ws");
  return wss;
}

// Send message to specific user
export function sendToUser(userId: number, message: any) {
  const userClients = clients.get(userId);
  if (userClients) {
    const payload = JSON.stringify(message);
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
}

// Broadcast to all connected clients
export function broadcast(message: any) {
  const payload = JSON.stringify(message);
  clients.forEach((userClients) => {
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });
}

// Get connected user count
export function getConnectedUsers(): number {
  return clients.size;
}

// Check if user is online
export function isUserOnline(userId: number): boolean {
  return clients.has(userId);
}
