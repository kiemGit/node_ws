const fs = require('fs');
const WebSocket = require('ws');
const pool2 = require('./database2');

const ws = new WebSocket('wss://gdsap.work.gd.', {
    rejectUnauthorized: false, // Ignore certificate validation
});

ws.on('open', () => {
  console.log('Secure WebSocket connection established');

  // Send a message to the server
  //const data = {
    //type: 'greeting',
    //message: 'Hello, secure server!',
  //};

  //ws.send(JSON.stringify(data));
  //console.log('Message sent:', data);

  // Send data every 5 seconds
  setInterval(() => {
    const data = {
      type: 'ping',
      timestamp: new Date().toISOString(),
    };

    ws.send(JSON.stringify(data));
    console.log('Data sent:', data);
  }, 5000); // 5000 milliseconds = 5 seconds
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
