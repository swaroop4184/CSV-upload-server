const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

// using cors to communicate between frontend and backend in case they are on the same address(origin)
app.use(cors());
app.use(express.json());

// Set up multer storage
const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('File received:', req.file);
  res.json({ message: 'File uploaded successfully' });
});

//Endpoint to parse CSV data from the requested file in a array of objects and sending it as the response
app.post('/getCsvData', (req, res)=>{
    const fileName = req.body.fileName;
    const filePath = `uploads/${fileName}`;
    const results = [];

    fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      // Process each row of the CSV and push it to the results array
      results.push(data);
    })
    .on('end', () => {
      // Send the results array as JSON in the response
      res.json({ data: results });
    })
    .on('error', (error) => {
      console.error('Error parsing CSV:', error);
      res.status(500).json({ error: 'Error parsing CSV' });
    });
})
//Endpoint which sends the list of available CSV files
app.get('/listCSVFiles', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
  
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return res.status(500).send({ error: 'Unable to scan directory' });
      }
  
      const csvFiles = files.filter((file) => path.extname(file) === '.csv');
  
      res.json({ csvFiles });
    });
  });
  //listing on the port specified
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
