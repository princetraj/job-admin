# Quick Start Guide - Job Portal Admin Panel

## 🚀 Getting Started

### 1. Start the Backend API

Make sure your Laravel backend is running:

```bash
cd C:\wamp64\www\jobprotal\job-portal-api
php artisan serve
```

The API should be running at `http://localhost:8000`

### 2. Start the Admin Panel

The admin panel is already running! If not, start it with:

```bash
cd C:\wamp64\www\jobprotal\admin-panel
npm start
```

The admin panel will open at `http://localhost:3000`

### 3. Login

Navigate to `http://localhost:3000/login` and use your admin credentials:

- **Email**: admin@jobportal.com (or your configured admin email)
- **Password**: Your admin password

## 📱 What You Can Do

### Dashboard
- View overview statistics
- Total employees, employers, jobs
- Pending CV requests
- Commissions (Super Admin only)

### Admin Management (Super Admin Only)
- Create new admins
- Assign roles (employee_manager, employer_manager, etc.)
- Edit/delete admins

### Employee Management
- View all employees in a data grid
- Search by name/email
- View detailed employee profiles
- Delete employees

### Employer Management
- View all employers (companies)
- Search by company name
- Paginated list view

### Job Management
- View all job postings
- Filter by status (active, inactive, expired)
- Search by job title
- See application counts

### Coupon Management (Super Admin Only)
- Create discount coupons
- Set discount percentage
- Set max uses and expiry dates
- Track usage

### Commission Management
- View all commissions (Super Admin)
- View your commissions (Staff)
- Track earnings

### CV Request Management
- View CV creation requests from employees
- Filter by status
- Update request status

### Plan Management
- View subscription plans
- Create new plans (Employee/Employer)
- Set pricing and features

### Catalog Management
- Manage Industries
- Manage Locations (City, State, Country)
- Manage Job Categories

## 🎨 User Interface Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Role-Based Access** - Menu items shown based on your role
- **Real-time Notifications** - Toast messages for actions
- **Data Grid** - Sortable, filterable tables with pagination
- **Search** - Quick search across all modules
- **Material Design** - Modern, clean UI with Material-UI v7

## 🔐 Roles & Permissions

| Role | Access |
|------|--------|
| **super_admin** | Full access to everything |
| **employee_manager** | Employees, Dashboard, CV Requests |
| **employer_manager** | Employers, Dashboard, Jobs |
| **plan_upgrade_manager** | Plans, Dashboard |
| **catalog_manager** | Catalogs, Dashboard |

## 🛠️ API Integration

All API calls are already configured and working with:
- Base URL: `http://localhost:8000/api/v1`
- Authentication: Bearer token (automatic)
- Auto-logout on 401 errors

## 📝 Notes

- The application uses localStorage for token storage
- Tokens are automatically included in all API requests
- Protected routes redirect to login if not authenticated
- Role-based routes redirect to dashboard if insufficient permissions

## 🐛 Troubleshooting

### Can't Login?
- Check if backend API is running at `http://localhost:8000`
- Verify admin credentials in database
- Check browser console for errors

### API Errors?
- Ensure CORS is enabled in Laravel backend
- Check if API routes are properly configured
- Verify database migrations are run

### Page Not Loading?
- Clear browser cache and localStorage
- Check browser console for JavaScript errors
- Ensure all npm packages are installed

## 📚 Next Steps

1. Test all modules with your backend API
2. Create test data for employees, employers, jobs
3. Test role-based access with different admin accounts
4. Customize theme colors in `src/App.js`
5. Add more features as needed

## 🎯 Key Files

- **Login**: `src/pages/auth/Login.js`
- **Dashboard**: `src/pages/dashboard/Dashboard.js`
- **API Config**: `src/services/api.js`
- **Routes**: `src/App.js`
- **Layout**: `src/components/layout/MainLayout.js`

Enjoy your new admin panel! 🎉
