// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  ws.on('message', message => {
    // Broadcast message to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Client-side WebSocket setup
// public/js/websocket.js
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle incoming data 
};

const broadcastText = (text) => {
  ws.send(JSON.stringify({ type: 'new-text', text }));
};

// Modify uploadText function to broadcast new text
export const uploadText = async (text) => {
  await addText({ content: text, sessionType: currentSession });
  broadcastText(text);
  displayTexts();
};
