# HakiBank - Online Banking Web Application

A complete, production-ready online banking system built with React and FastAPI and PostgreSQL.

## Features

### User Features
- **Account Management** - Secure user accounts with role-based access
- **Initial Balance Setup** - Set starting balance when creating an account
- **Money Transfers** - Instant transfers to other accounts
- **Transaction History** - Detailed transaction records with filtering
- **Bill Payments** - Pay various utility bills
- **Profile Management** - Update personal information and change passwords
- **Dashboard Analytics** - Visual spending charts and account overview

### Admin Features
- **User Management** - View, edit, suspend, and delete user accounts
- **Transaction Monitoring** - Monitor all system transactions with filters
- **Dashboard Analytics** - System-wide statistics and metrics
- **Admin Action Logs** - Track all administrative actions

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- HTTPS support ready
- SQL injection prevention
- CORS configuration

## 🛠️ Technology Stack

### Frontend
- React 18
- React Router v6
- Bootstrap 5
- Axios
- Chart.js
- Context API for state management

### Backend
- FastAPI (Python 3.9+)
- SQLAlchemy ORM
- PostgreSQL 14+
- JWT tokens (python-jose)
- Password hashing (passlib + bcrypt)
- Pydantic for validation



## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `PUT /api/users/me/password` - Change password

### Accounts
- `GET /api/accounts/me` - Get user accounts
- `GET /api/accounts/me/balance` - Get balance

### Transactions
- `GET /api/transactions/me` - Get transactions
- `POST /api/transactions/transfer` - Transfer money
- `POST /api/transactions/withdraw` - Withdraw
- `POST /api/transactions/deposit` - Deposit (admin)

### Bills
- `GET /api/bills/services` - Get bill services
- `POST /api/bills/pay` - Pay bill

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/transactions` - All transactions
- `GET /api/admin/actions` - Admin action logs

## License

MIT License - Feel free to use this project for learning or commercial purposes.


For the full setup please go to the **SETUP_GUIDE.md** file
