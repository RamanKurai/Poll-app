// src/utils/ws.ts
'use client';

import { ClientMessage, ServerMessage } from '@/app/types/index';

type MessageHandler = (message: ServerMessage) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler[] = [];

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket('ws://localhost:4000');

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerMessage;
      this.handlers.forEach((h) => h(msg));
    };
  }

  send(message: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected yet.');
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  close() {
    this.ws?.close();
  }
}

const wsClient = new WebSocketClient();
export default wsClient;
