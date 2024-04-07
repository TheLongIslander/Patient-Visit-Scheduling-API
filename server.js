const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const reservationRoutes = require('./reservationsRoutes');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('./reservations.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

// Use the reservation routes with the db instance
app.use('/api', reservationRoutes(db));

const port = 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
module.exports = app;