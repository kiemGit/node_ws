// server.js
const express = require('express');
const https = require('https');
const cors = require('cors');
const mysql = require('mysql2');
const createPool = require('./db'); // Import the createPool function
const pool = require('./database');
const pool1 = require('./database1');
const pool2 = require('./database2');
const bodyParser = require('body-parser');
// const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
// Read the self-signed certificate files
const privateKey = fs.readFileSync(path.join(__dirname, 'SSL2024', 'gunadarma.id_server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'SSL2024', 'gunadarma.id.crt'), 'utf8');
const ca = fs.readFileSync(path.join(__dirname, 'SSL2024', 'SectigoRSADomainValidationSecureServerCA.crt'), 'utf8');

// Create an HTTPS service with the certificate
const credentials = { key: privateKey, cert: certificate, ca: ca };

const app = express();
const PORT = 5000;

// Middleware to handle JSON data and CORS
app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());
// const pool = createPool();
function update_trs_barcode(req,res){
   const pool = createPool('iface');
   // function update_data(){
   //    const { id, name } = req.body;
   //    if (!id || !name) {
   //    return res.status(400).json({ error: 'ID and name are required' });
   //    }
   //    try {
   //    const result = updateData(id, name);
   //    if (result.affectedRows > 0) {
   //       res.json({ message: `Successfully updated record with ID ${id}.` });
   //    } else {
   //       res.status(404).json({ message: `No record found with ID ${id}.` });
   //    }
   //    } catch (error) {
   //    console.error('Error updating data:', error);
   //    res.status(500).json({ error: 'An error occurred while updating the data.' });
   //    }
   // }
   // Example function that performs some database operations
 async function performDatabaseOperations(code,trs_id) {
   const query = 'UPDATE trs.trs SET trs.trs.Status = 5 where Barcode = ? and trs.trs.ID = ?';
   const values = [code,trs_id];
   try {
      const [result] = await pool.query(query, values);
      return result;
   } catch (error) {
     throw error;
   }
 }
   // call function 
   const { code,trsID } = req.body;
   performDatabaseOperations(code,trsID)
      .then(() => {
      const pool = createPool('iface');   
      // Close the pool after operations are complete
      return pool.end();
      })
      .then(() => {
      const pool = createPool('iface');  
      // res.status(200).json({ message: 'Update success' });
      console.log('Connection pool closed.');
      })
      .catch((err) => {
      const pool = createPool('iface');  
      console.error('Error:', err.message);
      // Ensure the pool is closed in case of an error
      pool.end().then(() => {
         console.log('Connection pool closed after error.');
      });
      });
}

function getFormattedDate() {
   const date = new Date();
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');
   const seconds = String(date.getSeconds()).padStart(2, '0');
   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
 };
 
function current_date(){
   const currentDate = new Date();

   // Format the date and time for Jakarta, Indonesia
   const options = {
   // weekday: 'long',  // Full name of the day (e.g., "Monday")
   // year: 'numeric',  // Numeric year (e.g., "2024")
   // month: 'long',    // Full name of the month (e.g., "November")
   // day: 'numeric',   // Day of the month (e.g., "2")
   // hour: '2-digit',  // Two-digit hour (e.g., "09")
   // minute: '2-digit',// Two-digit minute (e.g., "05")
   // second: '2-digit',// Two-digit second (e.g., "59")
   // hour12: false,    // Use 24-hour time format
   // timeZone: 'Asia/Jakarta' // Specify the Jakarta timezone
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
   };
   // Use toLocaleString() to format the date
   // const formattedDate = currentDate.toLocaleString('id-ID', options);
   const formattedDate = currentDate.toLocaleString('en-US', options);
   return formattedDate
}
// Function to update data in the database
// async function updateData(id, newName) {
//    const query = 'UPDATE trs.trs SET trs.trs.Status = ? where Barcode = ?';
//    const values = [newName, id];
//    try {
//       const [result] = await pool.query(query, values);
//       return result;
//    } catch (error) {
//      throw error;
//    }
//  }
async function check_tcm(trs_trs_id){
   const today = new Date();
   const currentMonth = String(today.getMonth() + 1).padStart(2, '0'); 
   const currentYear = today.getFullYear();
   const tahun = currentYear;
   const bulan = currentMonth
   const tbl_tcm = "tc"+tahun+bulan+"i";
   const trs_id = trs_trs_id;
   const [rows_db_ada] = await pool2.query(
      'SELECT * from ?? WHERE TrsID = ?',
      [tbl_tcm,trs_id]
   );
   return rows_db_ada.length+1;
}
async function check_plat(plat_no,tcm_trs_id){
   const today = new Date();
   const currentMonth = String(today.getMonth() + 1).padStart(2, '0'); 
   const currentYear = today.getFullYear();
   const tahun = currentYear;
   const bulan = currentMonth
   const tbl_tcm = "tc"+tahun+bulan+"i";
   const reg_no = plat_no;
   const [rows_db_ada] = await pool2.query(
      'SELECT * from ?? WHERE RegNo = ? and TrsID = ?',
      [tbl_tcm,reg_no,tcm_trs_id]
   );
   return rows_db_ada.length+1;
}
async function check_data_guest(barcode_guest,trs_id_guest){
   const [rows_db_ada] = await pool1.query(
      'SELECT * from guest WHERE Barcode = ? and TrsID = ?',
      [barcode_guest,trs_id_guest]
   );
   console.log(rows_db_ada)
   return rows_db_ada.length+1;
}
async function check_iface(iface_barcode){ //trs.trs.status = 0 
   // console.log("erro check data sudah ada di database")
      const [rows_db_ada] = await pool1.query(
         // 'SELECT * from guest WHERE Barcode = ?',
         'SELECT t.Barcode,g.TrsID,t.ID from guest g LEFT JOIN trs.trs t ON t.ID = g.TrsID WHERE t.Barcode = ? AND status=0',
         [iface_barcode]
      );
      console.log(rows_db_ada)
      return rows_db_ada.length+1;
}
// async function update_status_trs(iface_barcode){
//       const [rows_db_update] = await pool1.query(
//          'SELECT t.Barcode,g.TrsID,t.ID from guest g LEFT JOIN trs.trs t ON t.ID = g.TrsID WHERE t.Barcode = ?',
//          [iface_barcode]
//       );
//       console.log(rows_db_update)
//       return rows_db_update.length+1;
// }
// Function to log data to a file
const logToFile = (data) => {
   const logStream = fs.createWriteStream(path.join(__dirname, 'requests.log'), { flags: 'a' });
   logStream.write(data + '\n');
   logStream.end();
 };
 
 // Custom middleware for logging requests and responses
app.use((req, res, next) => {
   // Log the request data
   const requestData = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
   };

   // Capture the response data
   const oldSend = res.send.bind(res);
   res.send = function (data) {
      const responseData = {
         statusCode: res.statusCode,
         body: data,
      };

      // Log both request and response data
      logToFile(JSON.stringify({ request: requestData, response: responseData }, null, 2));

      // Call the original send function
      return oldSend(data);
   };

   next();
});
// Sample API endpoint
app.post('/api/log', (req, res) => {
   const { message } = req.body;
   const response = { status: 'success', message: 'Log entry created', data: { message } };
   res.json(response);
});
// Define the API route to perform INSERT in Database 1 and UPDATE in Database 2
app.post('/api/insert-update', async (req, res) => {
   const { trsID, code, name, platNumber, reason } = req.body;
   const lup = '2022-03-01 13:49:16';
   const db1Pool = createPool('iface');
   const db2Pool = createPool('trs')
   const db1Connection = await db1Pool.getConnection();
   const db2Connection = await db2Pool.getConnection();
   try {
     // Start transaction on Database 1
     await db1Connection.beginTransaction();
 
     // INSERT operation in Database 1
     const insertQuery = 'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)';
     await db1Connection.execute(insertQuery, [trsID.TrsID, code.Barcode, name.name, platNumber.RegNo, reason.reason, lup]);
     // Commit the transaction on Database 1
     await db1Connection.commit();
     // Start transaction on Database 2
     await db2Connection.beginTransaction();
     // UPDATE operation in Database 2
     const updateQuery = 'UPDATE trs.trs SET trs.trs.Status = 5 where Barcode = ?';
     await db2Connection.execute(updateQuery, [code.Barcode]);
     // Commit the transaction on Database 2
     await db2Connection.commit();
     res.json({ message: 'Insert into Database 1 and update in Database 2 successful' });
   } catch (error) {
     // Roll back transactions in case of any error
     await db1Connection.rollback();
     await db2Connection.rollback();
     res.status(500).json({ message: 'Error performing insert and update', error: error.message });
   } finally {
     // Release the connections back to the pools
     db1Connection.release();
     db2Connection.release();
   }
 });
app.post('/api/update', async (req, res) => {
   update_trs_barcode(req,res);
 });
app.post('/api/select', async (req, res) => {
   // Create a pool of connections
   const pool = mysql.createPool({
   host: '192.168.0.39',
   user: 'root',
   password: 'sap123ok',
   database: 'iface',
   waitForConnections: true,
   connectionLimit: 10,  // Maximum number of connections in the pool
   queueLimit: 0         // No limit on queued requests
 }).promise();  // Enable promise-based usage
 // Example function that performs some database operations
 async function performDatabaseOperations() {
   try {
     const [results] = await pool.execute('SELECT * FROM guest');
     console.log('Query results:', results);
   } catch (err) {
     console.error('Error executing query:', err.message);
   }
 }
 // Call the function
 performDatabaseOperations()
   .then(() => {
     // Close the pool after operations are complete
     return pool.end();
   })
   .then(() => {
     res.status(200).json({ message: 'Req success' });
     console.log('Connection pool closed.');
   })
   .catch((err) => {
     console.error('Error:', err.message);
     // Ensure the pool is closed in case of an error
     pool.end().then(() => {
       console.log('Connection pool closed after error.');
     });
   });
});
app.post('/api/insert', async (req, res) => {
   // Create a pool of connections with promise support
   const pool = mysql.createPool({
      host: '172.30.31.21',
      user: 'sap',
      password: 'sap123',
      database: 'iface',
      waitForConnections: true,
      connectionLimit: 10,  // Maximum number of connections in the pool
      queueLimit: 0         // No limit on queued requests
   }).promise();  // Enable promise-based usage
   // Async function to insert data and check success
   async function insertData(TrsID, Barcode, name, RegNo, reason, lup) {
      try {
         const iface_chk = await check_iface(req.body.code);
         console.log("iface_check:",iface_chk);
         const trs_id_req = req.body.trsID;
         const plat_no_input = req.body.platNumber;
         if(iface_chk == 1){ // jika barcode tidak ada di [iface.guest]
            //20241111
            const plat_chk = await check_plat(plat_no_input,trs_id_req)
            console.log("plat_check:",plat_chk)
            if(plat_chk == 1){ // jika plat no tidak ditemukan di [tcm.tc202410i] karena salah input di form front end app
               res.status(405).json({ message: 'Cek kembali no plat',plat_no_input });
            }
            else{
               const trs_id_req = req.body.trsID;
               const guest_data_check = await check_data_guest(req.body.code,trs_id_req)
                  console.log("guest_data_check:",guest_data_check);
                  if (guest_data_check == 2){
                     res.status(406).json({ message: 'Data tamu sudah disimpan sebelum nya',trs_id_req });
                  }
                  else{
                     const insertQuery = 'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)';
                     const [results] = await pool.execute(insertQuery, [TrsID, Barcode, name, RegNo, reason, lup]);
                     // Check if the insert was successful
                     if (results.affectedRows > 0) {
                        console.log('Insert successful');
                        const currentEpochMillis = Date.now(); // Current epoch time in milliseconds
                        console.log('Current Epoch Time (milliseconds):', currentEpochMillis);
                        console.log(`Inserted ID: ${results.insertId}`);
                     } else {
                        console.log('No rows were inserted.');
                     }
                  }
                  
            }
            //20241111
         }
         else{
            console.log("Data eface 2");
            const trs_id_req = req.body.trsID;
            const guest_data_check = await check_data_guest(req.body.code,trs_id_req)
               console.log("guest_data_check:",guest_data_check);
               if (guest_data_check == 2){
                  res.status(406).json({ message: 'Data tamu sudah disimpan sebelum nya',trs_id_req });
               }
               else{
                  const plat_chk = await check_plat(plat_no_input,trs_id_req)
                  console.log("plat_check:",plat_chk)
                  if(plat_chk == 1){ // jika plat no tidak ditemukan di [tcm.tc202410i] karena salah input di form front end app
                     res.status(405).json({ message: 'Cek kembali no plat',plat_no_input });
                  }
                  else{
                     console.log("data eface 1");
                     const insertQuery = 'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)';
                     const [results] = await pool.execute(insertQuery, [TrsID, Barcode, name, RegNo, reason, lup]);
                     // Check if the insert was successful
                     if (results.affectedRows > 0) {
                        console.log('Insert successful');
                        const currentEpochMillis = Date.now(); // Current epoch time in milliseconds
                        console.log('Current Epoch Time (milliseconds):', currentEpochMillis);
                        console.log(`Inserted ID: ${results.insertId}`);
                     } else {
                        console.log('No rows were inserted.');
                     }
                  }
                  
               }
         }   
      } catch (err) {
      console.error('Error executing INSERT query:', err.message);
      }
   }
   // lup = '2022-03-01 13:49:16';
   lup = getFormattedDate();

   // Call the insert function

   insertData(req.body.trsID,req.body.code,req.body.name,req.body.platNumber,req.body.reason,lup)
      .then(() => {
      // Optional: Close the pool after all operations are done
      const current_date_result = current_date();
      res.status(200).json({ current_date_result, message: 'Insert success' });
      pool.end();
      })
      .catch((err) => {
      console.error('Error:', err.message);
      pool.end();
      });
   //call update trs.trs.Status   
   // update_trs_barcode(req,res);
});
app.post('/api/qr', async (req, res) => {
   //const { card_no, stat } = req.body; // Extract variables from the POST request body
   // const { card_no } = req.body.card_number;
   console.log(req.body.card_number);
   console.log(req.body.trs_id);
   lup = getFormattedDate();
   try {
      // Query the database using the extracted variables
      const [rows] = await pool.query(
      'SELECT trs.ID, guest.TrsID, trs.Status, trs.Barcode from trs LEFT JOIN iface.guest guest ON guest.TrsID = trs.ID WHERE trs.Barcode = ? AND status=0',
      [req.body.card_number]
      );
      console.log(rows)
      if (rows.length === 0) {
         return res.status(404).json({ message: 'No qr found' });
      }
         // console.log(rows);
         // console.log(rows[0].ID);
         // console.log(rows[0].Status);
         // console.log(rows[0].Barcode);
         const responseData = {
            id: rows[0].ID,
            status: rows[0].Status,
            barcode: rows[0].Barcode,
            name: "Universitas Gunadarma",
            icon: "gundar-logo.png",
            theme: "purple",
            lup: lup
         };
         res.json(responseData) 
         // return res.status(200).json({ responseData }); 
   } catch (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
   }
});
// save guest registration
app.post('/api/reg', async (req, res) => {
      console.log(req.body.trsID);
      console.log(req.body.code);
      console.log(req.body.name);
      console.log(req.body.platNumber);
      console.log(req.body.reason);
      const qr_code = req.body.code
      lup = '2022-03-01 13:49:16';
      try {
         // Query the database using the extracted variables
         const iface_chk = await check_iface(req.body.code);
         console.log("iface_check:",iface_chk);
         // console.log("test")
         const trs_id_req = req.body.trsID;
         const plat_no_input = req.body.platNumber;
         if(iface_chk == 1){ // jika barcode tidak ada di [iface.guest]
            const tcm_chk = await check_tcm(trs_id_req)
            console.log("tcm_check:",tcm_chk)
            const plat_chk = await check_plat(plat_no_input)
            console.log("plat_check:",plat_chk)
            // if(tcm_chk == 1){ // jika plat no tidak ditemukan di [tcm.tc202410i], hasil tangkapan lpr tidak sesuai dengan real 
            //    res.status(403).json({ message: 'Data Plat tidak ada di tcm',trs_id_req });
            // }
            if(plat_chk == 1){ // jika plat no tidak ditemukan di [tcm.tc202410i] karena salah input di form front end app
               res.status(405).json({ message: 'Cek kembali no plat',plat_no_input });
            }
            else{ // jika plat no ditemukan di [tcm.tc202410i]
               // 20241102 --
               // const [rows] = await pool1.query(
               //    'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)',
               //    [req.body.trsID,req.body.code,req.body.name,req.body.platNumber,req.body.reason,lup]
               // );
               // res.status(200).json({ message: 'Data Plat ada di tcm, data berhasil disimpan',rows});
               // 20241102 --
               // Define the INSERT query and values
               const insertQuery = 'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)';
               const values = [req.body.trsID,req.body.code,req.body.name,req.body.platNumber,req.body.reason,lup];
               // Execute the INSERT query using a pooled connection
               pool1.execute(insertQuery, values, (err, results) => {
               console.log('Insert Response:', results);   
               if (err) {
                  console.error('Error executing query:', err.message);
                  return;
               };
               // Handle the response from the INSERT query
               console.log('Insert Response:', results);
               if (results.affectedRows > 0) {
                  console.log(`Insert successful. Inserted ID: ${results.insertId}`);
                  res.json({ message: 'Data Berhasil disimpan'});
               } else {
                  console.log('No rows were inserted.');
               }
               });
            }
         }
         else{ // jika barcode ditemukan di [iface.guest]
            res.status(404).json({ message: 'Data guest sudah disimpan sebelumnya',trs_id_req });
         }
         // console.log("erro check data sudah ada di database")
         // const trs_id_req = req.body.trsID
         // const tcm_chk = await check_tcm(trs_id_req)
         // console.log("tcm_check:",tcm_chk)
         // if(tcm_chk == 1){
         //    // const [rows] = await pool1.query(
         //    //    'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)',
         //    //    [req.body.trsID,req.body.code,req.body.name,req.body.platNumber,req.body.reason,lup]
         //    // );
         //    res.status(403).json({ message: 'Data Plat tidak ada di tcm',trs_id_req });
         // }
         // else{
         //    const [rows] = await pool1.query(
         //       'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)',
         //       [req.body.trsID,req.body.code,req.body.name,req.body.platNumber,req.body.reason,lup]
         //    );
         //    res.status(200).json({ message: 'Data Plat ada di tcm',tcm_chk });
         // }
         // const today = new Date();
         // const currentMonth = String(today.getMonth() + 1).padStart(2, '0'); 
         // const currentYear = today.getFullYear();
         // const tahun = currentYear;
         // const bulan = currentMonth
         // const tbl_tcm = "tc"+tahun+bulan+"i";
         // const trs_id = req.body.trsID;
         // const [rows_db_ada] = await pool2.query(
         //    'SELECT * from ?? WHERE TrsID = ?',
         //    [tbl_tcm,trs_id]
         // );
         // console.log('current month',currentMonth)
         // console.log(rows_db_ada)
         // console.log(rows_db_ada.length)
         // console.log(rows_db_ada[0].Barcode)
         // // if (rows_db_ada.length === 0) {
         // if (tcm_chk.length === 0) {
         //    // return res.status(404).json({ message: 'Data Plat belum ada di iface' });
         //    return res.json({ message: 'Data Plat belum ada di iface' });
         //    // const [rows] = await pool1.query(
         //    // 'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)',
         //    // [req.body.trsID,req.body.code,req.body.name,req.body.platNumber,req.body.reason,lup]
         //    // );
         //    // res.status(200).json({ message: 'Data inserted successfully', id: rows.insertId }); 
         // }
         // if (tcm_chk.length != 0) {
         //    // return res.status(403).json({ message: 'Data ditemukan', id: rows_db_ada.insertId });
         //    // return res.status(403).json({ message: 'Data ditemukan', id: tcm_chk.insertId });
         //    return res.json({ message: 'Data ditemukan', id: tcm_chk.insertId });
         // }
         // const [rows] = await pool1.query(
         // 'INSERT INTO guest (TrsID, Barcode, name, RegNo, reason, lup) VALUES (?, ?, ?, ?, ?, ?)',
         // [req.body.trsID,req.body.code,req.body.name,req.body.platNumber,req.body.reason,lup]
         // );
         // if (rows.length === 0) {
         //    return res.status(404).json({ message: 'No qr found' });
         // }
         // res.status(200).json({ message: 'Data inserted successfully', id: rows.insertId }); 
         // res.status(200).json({ message: 'Data inserted successfully', qr_code}); 
      } catch (err) {
         console.error('Error executing query:', err.message);
         res.status(500).json({ error: 'Internal Server Error' });
      }
});

// Start the server
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

// Start the HTTPS server on port 3001 (you can change the port)

https.createServer(credentials, app).listen(PORT, () => {
  console.log(`Backend server running at https://carpark.gunadarma.id:${PORT}`);
});
