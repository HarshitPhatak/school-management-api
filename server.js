const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.static('public'));

// Middleware to parse incoming JSON data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));




// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Use your MySQL username (root is common)
  password: '1stTimeus!ngmySQL', // Your MySQL password
  database: 'school_management'
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Basic API endpoint to check if server is running
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// Add School API
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;
  
    // Validate the input data
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    // Prepare SQL query to insert the new school into the database
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err, result) => {
      if (err) {
        console.error('Error inserting school:', err);
        return res.status(500).json({ message: 'Error inserting school' });
      }
  
      // Return success response
      res.redirect('/');
    });
  });
  




  // Haversine formula to calculate the distance between two lat/long points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }
  
  // List Schools API - sorted by proximity to user's location
  app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;
  
    // Validate that latitude and longitude are provided and are valid numbers
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }
  
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }
  
    const query = 'SELECT * FROM schools';
    db.query(query, (err, schools) => {
      if (err) {
        console.error('Error retrieving schools:', err);
        return res.status(500).json({ message: 'Error retrieving schools' });
      }
  
      // Calculate the distance for each school and add it to the school object
      const schoolsWithDistance = schools.map(school => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          school.latitude,
          school.longitude
        );
        return { ...school, distance };
      });
  
      // Sort schools by distance
      schoolsWithDistance.sort((a, b) => a.distance - b.distance);
  
      // Return the sorted list of schools
      res.json(schoolsWithDistance);
    });
  });
  