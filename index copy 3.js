const fs = require('fs');
const WebSocket = require('ws');
const pool2 = require('./database2');

const ws = new WebSocket('wss://gdsap.work.gd.', {
    rejectUnauthorized: false, // Ignore certificate validation
});

async function test(t1,code){
  // const today = new Date();
  // const currentMonth = String(today.getMonth() + 1).padStart(2, '0'); 
  // const currentYear = today.getFullYear();
  // const tahun = currentYear;
  // const bulan = currentMonth
  // const tbl_tcm = "tc"+tahun+bulan+"i";
  // const reg_no = plat_no;
  // const [rows_db_ada] = await pool2.query(
  //    'SELECT * from ?? WHERE id = ?',
  //    [t1,code]
  // );
  // return rows_db_ada.length+1;

  try {
    // Run the SQL query to fetch data
    const [rows_db_ada] = await pool2.query(
      'SELECT * FROM ?? WHERE id = ?',
      [t1, code]
    );
    
    // Return the length of rows + 1 as part of the JSON response
    return {
      success: true,
      data: rows_db_ada
    };
  } catch (error) {
    console.error(error);
    // Return an error response if something goes wrong
    return {
      success: false,
      message: 'An error occurred while querying the database.'
    };
  }
}

const result = test("t1", 2);
// Send the result as a JSON response
const js_data = json(result);
console.log(js_data)

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
