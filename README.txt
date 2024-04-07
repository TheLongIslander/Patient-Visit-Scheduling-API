# Reservation System API

## Overview
This Reservation System API is designed to handle reservation requests, including finding available dates, making, looking up, and cancelling reservations. The API leverages Express.js for server handling, SQLite3 for database interactions, and includes custom utility functions for date handling and validation.

## Files and Their Roles
1. **server.js**: Initializes the Express application, sets up middleware, connects to the SQLite database, and listens for requests on a specified port.
2. **reservationsRoutes.js**: Defines API endpoints for various reservation actions (e.g., finding available dates, making a reservation) and routes them appropriately.
3. **reservationsHandler.js**: Contains functions that interact directly with the SQLite database to perform actions like checking date availability, creating, and cancelling reservations.
4. **utils.js**: Provides utility functions for date manipulation, holiday checking, and format conversion to support the reservation process.
5.  **schedulerSpec.js**: Provides Jasmine Supertest cases to run test cases on the server. This file is located in the "spec" directory within the main project directory.

## Setup Instructions
1. Ensure Node.js and npm are installed on your system.
2. Start the application by running 
	
	node server.js 

The server will start and listen for requests on port 3000.

## Dependencies
- express: Web server framework

	npm install express

- body-parser: Middleware for parsing incoming request bodies

	npm install body-parser
- sqlite3: SQLite database to store reservation data

	npm install sqlite3

- date-holidays: Utility for checking public holidays

	npm install date-holidays

- crypto, uuid: Generate unique identifiers for reservations

	npm install uuid

- supertest: Running test cases with jasmine

	npm install supertest


## Usage
Using Postman, you can interact with the server in the following ways:

## API Endpoints
- `GET /api/available-dates`: Find the next available dates for reservation.
- `POST /api/reserve`: Make a new reservation.
- `GET /api/reservations/:email`: Look up reservations by email.
- `POST /api/cancel-reservation`: Cancel an existing reservation.



## Features

- **Flexible Date Handling**: Automatically handles date validations, including checking for weekends and holidays to only allow reservations on valid dates.

- **Reservation Management**: Supports operations to make, look up, and cancel reservations efficiently with simple API calls.

- **Error Handling**: Implements error handling to respond with appropriate error messages for various invalid requests.

### Finding Available Dates
- Endpoint: `GET /api/available-dates?startDate=YYYY-MM-DD&N=number`

- Parameters: `startDate` (optional, defaults to today's date if not provided or invalid), `N` (required, the number of future available dates to find).



	Example of URL in Postman:
					http://localhost:3000/api/available-dates?startDate=2024-05-13&N=4


- Description: Returns the next N available dates starting from either the provided start date or today.


### Making a Reservation

- Endpoint: `POST /api/reserve`

- Body (uses Content-Type "application/json"): `{"DTSTART": "YYYY-MM-DD", "ATTENDEE": "email@example.com"}`

	Example of Body:
	
			{
  				"DTSTART": "2025-03-07",
  				"ATTENDEE": "thisIsAnExampleEmail@gmail.com"
			}

- Description: Attempts to make a reservation for the given date and email. Returns a confirmation code if successful.

### Looking Up Reservations

- Endpoint: `GET /api/reservations/:email`

- Parameters: `email` (required, email address to look up reservations for).


	Example of URL in Postman:

				http://localhost:3000/api/reservations/tomdurie24@gmail.com



- Description: Returns all reservations associated with the provided email.

### Cancelling a Reservation

- Endpoint: `POST /api/cancel-reservation`

- Body (uses Content-Type "application/json"): `{"confirmationCode": "code"}`

	Example of Body:
			{
    			"confirmationCode": "da23106b"
			}

- Description: Cancels the reservation associated with the given confirmation code.

##Optional

This package includes an optional and simple JSON to SQLite3 converter in case one would want to import data from a JSON file into an SQLite3 database. This is optional because by default, a test SQLite3 database is included with this package.