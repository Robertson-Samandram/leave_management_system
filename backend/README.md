# Backend README

# Full Stack Project - Backend

This is the backend part of the Full Stack Project, built using Node.js and PostgreSQL. This README provides instructions for setting up and running the backend application.

## Prerequisites

- Node.js (version 14 or higher)
- PostgreSQL (version 12 or higher)

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:

   ```
   cd full-stack-project/backend
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Set up your PostgreSQL database. Create a database and update the connection settings in `src/config/database.js`.

## Running the Application

To start the backend server, run:

```
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

The following API endpoints are available:

- `GET /api/items`: Retrieve a list of items.
- `POST /api/items`: Create a new item.

## Testing

To run tests, use:

```
npm test
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.