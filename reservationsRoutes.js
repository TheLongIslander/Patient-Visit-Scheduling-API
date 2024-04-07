const express = require('express');
const reservationsHandler = require('./reservationsHandler');

module.exports = (db) => {
    const router = express.Router();

    // Find the next available date
    router.get('/available-dates', async (req, res) => {
        try {
            let { startDate, N } = req.query; // Get startDate and N from query parameters
            const n = parseInt(N, 10); // Convert N to an integer

            // Validate n is within the allowed range
            if (isNaN(n) || n < 1 || n > 4) {
                return res.status(400).json({ error: 'N must be between 1 and 4.' });
            }

            // Ensure startDate is not in the past
            let inputDate = new Date(startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for comparison
            inputDate.setHours(0, 0, 0, 0); // Normalize input date

            // If inputDate is invalid, in the past, or not provided, default to today
            if (isNaN(inputDate.getTime()) || inputDate < today || !startDate) {
                inputDate = today;
            }

            // Format inputDate back to YYYY-MM-DD for function compatibility
            startDate = inputDate.toISOString().split('T')[0];

            // Proceed to find available dates starting from either today or a valid future startDate
            const availableDates = await reservationsHandler.findNextAvailableDate(db, startDate, n);
            res.json({ availableDates });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });


    // Make a reservation
    router.post('/reserve', async (req, res) => {
        const { DTSTART, ATTENDEE } = req.body;

        // Validate date format and check if it's in the past
        if (!/^\d{4}-\d{2}-\d{2}$/.test(DTSTART) || new Date(DTSTART).toString() === 'Invalid Date' || new Date(DTSTART) < new Date()) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(DTSTART) || new Date(DTSTART).toString() === 'Invalid Date') {
                return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
            } else if (new Date(DTSTART) < new Date()) {
                return res.status(400).json({ error: 'Date is in the past. Please choose a future date.' });
            }
        }
        // Validate email address format
        if (!/\S+@\S+\.\S+/.test(ATTENDEE)) {
            return res.status(400).json({ error: 'Invalid email address. Please enter a valid email.' });
        }
        try {
            const confirmationCode = await reservationsHandler.makeReservation(db, { DTSTART, ATTENDEE });
            res.json({ confirmationCode });
        } catch (error) {
            // Now catching errors thrown by makeReservation
            res.status(400).json({ error: error.message });
        }
    });

    // Lookup reservations by email
    router.get('/reservations/:email', async (req, res) => {
        const { email } = req.params;
        // Validate email address format
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ error: 'Invalid email address. Please enter a valid email.' });
        }
    
        try {
            const reservations = await reservationsHandler.lookupReservations(db, email);
            res.json({ reservations });
        } catch (error) {
            // Handle the case where no reservations are found
            res.status(404).json({ error: error.message });
        }
    });

    // Cancel a reservation
    router.post('/cancel-reservation', async (req, res) => {
        try {
            const { confirmationCode } = req.body;
            const success = await reservationsHandler.cancelReservation(db, confirmationCode);
            if (success) {
                res.json({ message: 'Reservation cancelled successfully.' });
            } else {
                res.status(404).json({ message: 'Confirmation code not found.' });
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    // Catch-all middleware for undefined routes
    router.use('*', (req, res) => {
        res.status(404).json({ error: 'This is an invalid route. Please check the URL and try again.' });
    });


    return router;
};
