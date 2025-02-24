const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const saltRounds = 10;

const mariadb = require('mariadb');


/* 

        DATABASE CONNECTION

*/

const pool = mariadb.createPool({
    host: 'localhost', 
    user: 'root',     
    password: 'password', 
    database: 'DTB', 
    connectionLimit: 10
});

async function getConnection() {
    let co;
    try {
        co = await pool.getConnection();
        console.log("Connected to MariaDB!");
    } catch (err) {
        console.error("Error connecting to database:", err);
    }
    return co;
}

getConnection();


/*

        MAIN GET AND POST REQUEST

*/

// Middleware to parse JSON and form data
app.use(bodyParser.json());  // For JSON data
app.use(bodyParser.urlencoded({ extended: true }));  // For form data


// Main get request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/list', (req, res) => {
    res.json({message : "liste des usernames"});
});



// Handle registering submission
app.post('/submit-form', async (req, res) => {
    const { name, email, password} = req.body; // Get form data

    if(!name || !email || !password) {
        return res.status(400).json({ error: "Name, email and password are required!" });
    }

    let co;
    try {
        co = await pool.getConnection();

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = "INSERT INTO users (name, email, hashedpassword) VALUES (?, ?, ?)";
        await co.query(query, [name, email, hashedPassword]);

    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (co) co.release();
    }
    
});


//Handle connecting submission
app.post('/submit-connection', async (req, res) => {
    const { email, password} = req.body; // Get form data

    if( !email || !password) {
        return res.status(400).json({ error: "email and password are required!" });
    }

    let co;
    try {
        co = await pool.getConnection();
        const query = "SELECT * FROM users WHERE email = ?";
        const rows = await co.query(query, [email]);

        if(rows.length === 0) return res.json({ exists: false, message: "User not registered." });

        const user = rows[0];

        const pwMatch = await bcrypt.compare(password, user.hashedpassword);

        if(pwMatch) {
            res.sendFile(path.join(__dirname, 'connected.html'));
        }

        else res.json({ exists: false, message: "Incorrect email or password." });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        if (co) co.release(); // Release connection back to pool
    }
    
});

// Starting server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});