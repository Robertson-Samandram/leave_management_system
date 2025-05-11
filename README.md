# Full Stack Project

This project is a full stack application built with Node.js for the backend and PostgreSQL for the database. The frontend remains unchanged for now.

## Project Structure

```
full-stack-project
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── config
│   │   │   └── database.js
│   │   ├── controllers
│   │   │   └── index.js
│   │   ├── models
│   │   │   └── index.js
│   │   ├── routes
│   │   │   └── index.js
│   │   └── services
│   │       └── index.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Set up the PostgreSQL database:
   - Ensure you have PostgreSQL installed and running.
   - Create a database for the application.

4. Configure the database connection:
   - Update the `backend/src/config/database.js` file with your database credentials.

5. Start the backend server:
   ```
   node src/app.js
   ```

## API Usage

- The backend exposes various API endpoints for interacting with the database.
- Refer to the `backend/README.md` for detailed API documentation and usage instructions.

## Frontend

- The frontend is currently unchanged. Further instructions will be provided once the frontend is integrated with the backend.

## License

This project is licensed under the MIT License.