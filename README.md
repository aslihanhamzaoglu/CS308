# CS308 E-commerce Project

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