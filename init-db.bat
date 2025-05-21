@echo off
echo Initializing database...

REM Wait for MySQL to be ready
timeout /t 10

REM Execute database_scripts.sql
echo Creating tables...
type CS308-Backend\MySQL_scripts\database_scripts.sql | docker exec -i cs308-db mysql -u root -prootpassword ecommerce_db

REM Execute demo_data.sql
echo Loading demo data...
type CS308-Backend\MySQL_scripts\demo_data.sql | docker exec -i cs308-db mysql -u root -prootpassword ecommerce_db

echo Database initialization complete! 