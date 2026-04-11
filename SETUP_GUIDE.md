# Complete Setup Guide - Online Banking System

This guide will walk you through setting up the complete Online Banking Web Application from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Application](#testing-the-application)
## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

1. **PostgreSQL 14+**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Python 3.9+**
   - Download from [python.org](https://www.python.org/downloads/)
   - Verify: `python --version`

3. **Node.js 16+ and npm**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` and `npm --version`



## Database Setup

### Step 1: Start PostgreSQL Service

**Windows:**
```cmd
# PostgreSQL should start automatically after installation
# Or use Services app to start "postgresql-x64-14"
```

### Step 2: Create Database

Open terminal/command prompt and run:

```bash
# Access PostgreSQL as postgres user
psql -U postgres

# You'll be prompted for password (default is often 'postgres')
```

In the PostgreSQL prompt, run:

```sql
-- Create the database
CREATE DATABASE banking_db;

-- Verify it was created
\l

-- Exit
\q
```

### Step 3: Run Database Schema (Optional Method 1)

If you want to manually run the SQL schema:

```bash
psql -U postgres -d banking_db -f database_schema.sql
```

**OR** use the Python initialization script (recommended, see Backend Setup).

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment

**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn
- SQLAlchemy
- Psycopg2
- Pydantic
- Python-jose
- Passlib
- And other dependencies

### Step 4: Create Environment File

Create a file named `.env` in the `backend` directory with the following content:

```env
# Application Settings
APP_NAME=Online Banking System
VERSION=1.0.0
DEBUG=True

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/banking_db

# Security (CHANGE THIS IN PRODUCTION!)
SECRET_KEY=your-secret-key-change-this-in-production-use-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

**Important Notes:**
- Replace `postgres:postgres` in DATABASE_URL with your PostgreSQL username:password
- Change `SECRET_KEY` to a long random string for production
- Port 5432 is the default PostgreSQL port

### Step 5: Initialize Database

Run the initialization script:

```bash
python init_db.py
```

You should see:
```
Initializing database...
✓ Tables created successfully
✓ Admin user created: admin@bank.com / admin123
✓ Bill services created
============================================================
Database initialized successfully!
============================================================
Admin Login: admin@bank.com / admin123
============================================================
```

### Step 6: Test Backend

Start the backend server:

```bash
python run.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Open browser and visit:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs (Interactive Swagger UI)
- Health Check: http://localhost:8000/health

**Keep this terminal open** with the backend running.

## Frontend Setup

### Step 1: Open New Terminal

Open a **new** terminal/command prompt (keep backend running in the first one).

### Step 2: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- React
- React Router
- Bootstrap
- Axios
- Chart.js
- And other dependencies

This may take a few minutes.

### Step 4: Verify API Configuration

Open `frontend/src/utils/constants.js` and verify:

```javascript
export const API_BASE_URL = 'http://localhost:8000';
```

This should match your backend URL.

### Step 5: Start Frontend

```bash
npm start
```

The application should automatically open in your browser at http://localhost:3000

If not, manually open: http://localhost:3000

## Running the Application

### Starting Both Services

You need **TWO terminal windows** running simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
# Windows:
venv\Scripts\activate


python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Stopping the Application

- Press `Ctrl+C` in each terminal to stop the servers
- Deactivate Python virtual environment: `deactivate`

## Testing the Application

### 1. Login as Admin

1. Open http://localhost:3000
2. Click "Login"
3. Enter credentials:
  - Email: `admin@hakibank.com`
  - Password: `admin123`
4. You'll be redirected to Admin Dashboard

### 2. Create a Test User

1. Logout (click logout button)
2. Go to http://localhost:3000/signup
3. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123
   - Confirm Password: test123
   - Account Type: Main Account
   - Initial Balance: 1000 (or any amount you want to start with)
4. Click "Sign Up"
5. Login with the new credentials
6. You should see your initial balance in the dashboard

### 3. Test User Features

As a regular user, test:
- ✅ View dashboard with balance
- ✅ Make a transfer (you'll need another account)
- ✅ View transaction history
- ✅ Pay a bill
- ✅ Update profile
- ✅ Change password

### 4. Test Admin Features

Login as admin and test:
- ✅ View admin dashboard statistics
- ✅ Manage users (edit, suspend, delete)
- ✅ Monitor all transactions
- ✅ View admin action logs

### 5. Test Money Transfer

1. Create two user accounts
2. Login as first user
3. Note the account number
4. Logout and login as second user
5. Go to "Transfer Money"
6. Enter first user's account number
7. Enter amount and transfer
8. Check both accounts to verify the transfer