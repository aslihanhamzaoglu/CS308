# CS308 Project

This repository contains both frontend and backend code for the CS308 project.

## Project Structure

- `CS308-Frontend`: Frontend React application
- `CS308-Backend`: Backend Node.js application
- `docker-compose.yml`: Docker configuration for running the full stack

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized setup)

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/aslihanhamzaoglu/CS308.git
   cd CS308
   ```

2. Set up the Frontend:
   ```
   cd CS308-Frontend
   npm install
   ```

3. Set up the Backend:
   ```
   cd ../CS308-Backend
   npm install
   ```

### Running the Application

#### Using Docker (Recommended)

To run the entire application stack (frontend, backend) using Docker:

```
docker-compose up --build
```

This will build and start both the frontend and backend services. The application will be accessible at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

#### Running Locally (Without Docker)

1. Start the Backend:
   ```
   cd CS308-Backend
   npm start
   ```

2. Start the Frontend (in a separate terminal):
   ```
   cd CS308-Frontend
   npm start
   ```

## Environment Files

Both the frontend and backend use environment files for configuration:

- `CS308-Frontend/.env`: Frontend environment variables
- `CS308-Backend/.env`: Backend environment variables

The environment files should already be included in the repository for easy setup.

## Database

The application uses a MySQL database. The schema diagram can be found in `db-scheme.jpg`.

## Contributing

1. Make sure you pull the latest changes before starting work
2. Create a new branch for your features
3. Submit a pull request for review

## License

All rights reserved.

## Database Initialization

To initialize the database with tables and demo data, follow these steps:

### Step 1: Stop and Clean Existing Containers
```bash
docker-compose down -v
```
This command stops all running containers and removes volumes to ensure a clean start.

### Step 2: Start the Containers
```bash
docker-compose up -d
```
This starts all services (frontend, backend, and database) in detached mode.

### Step 3: Initialize Database
```bash
.\init-db.bat
```
This script will:
- Wait for MySQL to be ready
- Create all necessary tables using `database_scripts.sql`
- Load demo data using `demo_data.sql`

### Verify Database Setup
To verify that the database was initialized correctly, run:
```bash
docker exec -it cs308-db mysql -u root -prootpassword ecommerce_db -e "SHOW TABLES;"
```

### Database Credentials
- Database Name: `ecommerce_db`
- Username: `root`
- Password: `rootpassword`
- Port: `3306`

### Resetting the Database
If you need to reset the database and start fresh:
1. Run `docker-compose down -v`
2. Start again from Step 1

### Troubleshooting
If you encounter any issues:
1. Make sure all containers are running: `docker ps`
2. Check container logs: `docker-compose logs`
3. Ensure MySQL is ready before running init-db.bat (wait 10-15 seconds after starting containers) 