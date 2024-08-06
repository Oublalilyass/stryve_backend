const ws = new WebSocket('ws://localhost:3308');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'new-text') {
    // Update the Publisher session content with the new text data
    document.getElementById('publisherContent').innerText = data.content;
  }
};

const broadcastText = (text) => {
  ws.send(JSON.stringify({ type: 'new-text', content: text }));
};

document.getElementById('writerInput').addEventListener('input', (event) => {
  const text = event.target.value;
  broadcastText(text);
});
