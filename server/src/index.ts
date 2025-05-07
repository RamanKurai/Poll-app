import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createRoom, joinRoom, castVote, getRoomState } from "./room";
import { ClientMessage } from "./types";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<WebSocket, { userId: string; roomCode: string }>();

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString()) as ClientMessage;

    if (msg.type === "create") {
      const { room, user } = createRoom(msg.name);
      clients.set(ws, { userId: user.id, roomCode: room.code });

      const state = getRoomState(room.code);
      send(ws, "joined", {
        roomCode: room.code,
        userId: user.id,
        timeLeft: state?.timeLeft ?? 60,
      });

      broadcast(room.code);
    }

    if (msg.type === "join") {
      const result = joinRoom(msg.roomCode, msg.name);
      if (result.room && result.user) {
        clients.set(ws, { userId: result.user.id, roomCode: result.room.code });

        const state = getRoomState(result.room.code);
        send(ws, "joined", {
          roomCode: result.room.code,
          userId: result.user.id,
          timeLeft: state?.timeLeft ?? 60,
        });

        broadcast(result.room.code);
      } else {
        send(ws, "error", { message: "Room not found" });
      }
    }

    if (msg.type === "vote") {
      const info = clients.get(ws);
      if (info) {
        castVote(info.roomCode, info.userId, msg.option);
        broadcast(info.roomCode);
      }
    }
  });

  // Handle WebSocket closure
  ws.on("close", () => {
    const clientInfo = clients.get(ws);
    if (clientInfo) {
      console.log(`Client disconnected from room ${clientInfo.roomCode}`);
    } else {
      console.log("Client disconnected");
    }
    clients.delete(ws);
  });

  // Handle WebSocket errors gracefully
  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error}`);
  });
});

function broadcast(roomCode: string) {
  const state = getRoomState(roomCode);
  if (!state) {
    console.error(`Failed to get state for room: ${roomCode}`);
    return;
  }

  for (const [ws, info] of clients.entries()) {
    if (info.roomCode === roomCode && ws.readyState === ws.OPEN) {
      try {
        const message = JSON.stringify({
          type: "update",
          payload: state, // includes timeLeft now
        });

        ws.send(message);
        console.log(`Sent update to client in room ${roomCode}`);
      } catch (error) {
        console.error(`Error serializing room state for ${roomCode}:`, error);
      }
    }
  }
}

function send(ws: WebSocket, type: string, payload: any) {
  console.log("[BACKEND WS SEND]", { type, payload }); // ✅ Add this
  ws.send(JSON.stringify({ type, payload }));
}

server.listen(4000, () => {
  console.log("WebSocket server running on http://localhost:4000");
});
