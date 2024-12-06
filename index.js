const mysql = require('mysql2');  // MySQL client
const WebSocket = require('ws');  // WebSocket library
const express = require('express');  // Optional: for serving the app if needed
const pool2 = require('./database2');


// WebSocket server setup
const wss = new WebSocket.Server({ host: '0.0.0.0', port: 8080 });  // WebSocket server listens on port 8080

// Function to fetch data from MySQL
async function fetchDataFromDatabase() {
  try {
    const [rows] = await pool2.query('SELECT * FROM t1 WHERE code = 2');
    return rows; // Return the rows from the database
  } catch (err) {
    console.error('Error fetching data:', err);
    return { error: 'Failed to fetch data' }; // Return an error object
  }
}

wss.on('connection', async  (ws) => {
  console.log('New WebSocket client connected');

  // Query data from MySQL and send it to WebSocket clients
  pool2.query('SELECT * FROM t1 WHERE code = ?', [2], (err, results) => {
    if (err) {
      console.error('Error fetching data from MySQL:', err);
      return;
    }
    // Sending the result as a JSON object
    ws.send(JSON.stringify({
      success: true,
      data: results
    }));
  });

  try {
    // Fetch data from the database
    const data = await fetchDataFromDatabase();

    // Send the resolved data to the WebSocket client
    ws.send(JSON.stringify(data)); // Convert data to JSON before sending
  } catch (err) {
    ws.send(JSON.stringify({ error: 'An error occurred' })); // Handle errors gracefully
  }

  // Handle messages from the client
  ws.on('message', async (message) => {
    console.log('Received message:', message);
    // Respond back to the client (if needed)
    ws.send('Message received: ' + message);
    if(message == "hakim_revlim"){
      try {
        // Fetch data from the database
        const data = await fetchDataFromDatabase();
    
        // Send the resolved data to the WebSocket client
        ws.send(JSON.stringify(data)); // Convert data to JSON before sending
      } catch (err) {
        ws.send(JSON.stringify({ error: 'An error occurred' })); // Handle errors gracefully
      }
    }
  });

  // Handle close connection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Express app (Optional)
const app = express();
app.get('/', (req, res) => {
  res.send('WebSocket server is running!');
});

// Define a route to fetch data from MySQL
app.get('/data', async (req, res) => {
  try {
     // Query the database using the extracted variables
     const [rows] = await pool2.query(
     'SELECT * FROM t1 WHERE code = ?',
     [2]
     );
     console.log(rows)
     res.json(rows) 
  } catch (err) {
     console.error('Error executing query:', err.message);
     res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Express server running on port 3000');
});
