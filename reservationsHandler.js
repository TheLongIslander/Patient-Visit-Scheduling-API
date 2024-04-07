const sqlite3 = require('sqlite3').verbose();
const { isWeekend, formatDate, convertToICalendarFormat, convertFromICalendarFormat, isHoliday } = require('./utils');
const crypto = require('crypto');
const uuid = require('uuid');

// Helper function to connect to the SQLite database
function connectToDb() {
    return new sqlite3.Database('./reservations.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) console.error(err.message);
    });
}


const isDateReserved = (db, inputDate) => {
    return new Promise((resolve, reject) => {
        const formattedInputDate = convertToICalendarFormat(inputDate);
        db.get(`SELECT COUNT(*) AS count FROM reservations WHERE DTSTART LIKE ? AND STATUS != 'CANCELLED'`, [formattedInputDate + '%'], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.count > 0);
            }
        });
    });
};


const findNextAvailableDate = (db, startDate, n) => {
    return new Promise(async (resolve, reject) => {
        let availableDates = [];
        let currentDate = new Date(startDate);
        currentDate.setUTCHours(9, 0, 0, 0); // Set to 9:00 AM UTC
        while (availableDates.length < n) {
            currentDate.setDate(currentDate.getDate() + 1); // Increment the day
            const isReserved = await isDateReserved(db, formatDate(currentDate));
            const isWknd = isWeekend(currentDate);
            const isHldy = isHoliday(currentDate);
            if (!isReserved && !isWknd && !isHldy) {
                availableDates.push(formatDate(currentDate)); // Add to results if the date is valid
            }
        }
        resolve(availableDates); // Resolve the promise with the found dates
    });
};

const makeReservation = (db, { DTSTART, ATTENDEE }) => {
    return new Promise(async (resolve, reject) => {
        // Predefine METHOD and STATUS
        const METHOD = 'REQUEST';
        const STATUS = 'CONFIRMED';

        let fDate = new Date(DTSTART);    
        fDate.setUTCHours(9, 0, 0, 0); // Set to 9:00 AM UTC
        const dateIsReserved = await isDateReserved(db, DTSTART);
        const dateIsWeekend = isWeekend(fDate);     
        const dateIsHoliday = isHoliday(fDate);

        if (dateIsReserved || dateIsWeekend || dateIsHoliday) {
            reject(new Error('The date is not available for reservation. Please try a different date.'));
            return;
        }

        // Generate a confirmation code
        const rawId = uuid.v4();
        const confirmationCode = crypto.createHash('sha256').update(rawId).digest('hex').substring(0, 8);

        // Insert the reservation into the database
        const iCalendarDTSTART = convertToICalendarFormat(DTSTART, "09:00:00");
        const DTSTAMP = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -1) + 'Z';

        db.run(`INSERT INTO reservations (DTSTART, ATTENDEE, DTSTAMP, METHOD, STATUS, confirmationCode) VALUES (?, ?, ?, ?, ?, ?)`,
            [iCalendarDTSTART, `mailto:${ATTENDEE}`, DTSTAMP, METHOD, STATUS, confirmationCode], function(err) {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(confirmationCode);
                }
            });
    });
};
const lookupReservations = (db, email) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM reservations WHERE ATTENDEE = ?`, [`mailto:${email}`], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // Check if any reservations were found
                if (rows.length === 0) {
                    // Reject the promise with a user-friendly error message if no reservations were found
                    reject(new Error('No reservations found for the specified email.'));
                } else {
                    resolve(rows.map(row => ({
                        ...row,
                        DTSTART: convertFromICalendarFormat(row.DTSTART), //Convert DTSTART to human-readable format
                        DTSTAMP: convertFromICalendarFormat(row.DTSTAMP), //Convert DTSTAMP to human-readable format
                        ATTENDEE: row.ATTENDEE.replace('mailto:', '') // Clean up email format
                    })));
                }
            }
        });
    });
};
const cancelReservation = (db, confirmationCode) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE reservations SET STATUS = 'CANCELLED' WHERE confirmationCode = ?`, [confirmationCode], function(err) {
            if (err) {
                reject(err);
            } else {
                if (this.changes > 0) {
                    resolve(true); // Successfully updated at least one row
                } else {
                    resolve(false); // No rows were updated; the confirmation code was not found
                }
            }
        });
    });
};
module.exports = { findNextAvailableDate, makeReservation,lookupReservations,cancelReservation};
