const mariadb = require('mariadb');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON and form data
app.use(bodyParser.json());  // For JSON data
app.use(bodyParser.urlencoded({ extended: true }));  // For form data

// Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/list', (req, res) => {
    res.json({message : "liste des usernames"});
});

// Handle form submission
app.post('/submit-form', (req, res) => {
    const formData = req.body; // Get form data
    res.json({message : "Form submitted successfully!"});
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});