# Job Portal Admin Panel

A modern, feature-rich admin panel built with React 19 and Material-UI v7 for managing the Job Portal application.

## Tech Stack

- **React 19.1.1** - UI library
- **Material-UI (MUI) v7** - Component library
  - MUI Data Grid - Tables with pagination
  - MUI Date Pickers - Date handling
  - MUI Icons
- **React Router DOM v7** - Routing
- **Axios** - HTTP client
- **Day.js** - Date manipulation
- **Emotion** - CSS-in-JS styling
- **Notistack** - Toast notifications
- **Create React App** - Project scaffolding

## Features

### Authentication
- Secure login system with JWT tokens
- Role-based access control
- Automatic token refresh handling

### Admin Roles
- **super_admin** - Full access to all features
- **employee_manager** - Manage employees
- **employer_manager** - Manage employers
- **plan_upgrade_manager** - Manage plans and subscriptions
- **catalog_manager** - Manage industries, locations, categories

### Modules

1. **Dashboard** - Overview with statistics cards
2. **Admin Management** (Super Admin only)
   - Create, edit, delete admins
   - Assign roles
3. **Employee Management**
   - View all employees with pagination
   - Search functionality
   - View detailed employee profiles
   - Delete employees
4. **Employer Management**
   - View all employers with pagination
   - Search functionality
   - Company details
5. **Job Management**
   - View all jobs with filters
   - Filter by status (active, inactive, expired)
   - Search by job title
6. **Coupon Management** (Super Admin only)
   - Create discount coupons
   - Set expiry dates and usage limits
   - Track coupon usage
7. **Commission Management**
   - View all commissions (Super Admin)
   - View personal commissions (Staff)
   - Add manual commissions
8. **CV Request Management**
   - View CV creation requests
   - Update request status
   - Upload completed CVs
9. **Plan Management**
   - Create and manage subscription plans
   - Add plan features
   - Set pricing and validity
10. **Catalog Management**
    - Industries
    - Locations (with state and country)
    - Job Categories

## Installation

The application is already set up in `C:\wamp64\www\jobprotal\admin-panel`

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Running backend API at `http://localhost:8000`

### Dependencies Installed
All required dependencies have been installed. If you need to reinstall:

```bash
cd C:\wamp64\www\jobprotal\admin-panel
npm install
```

## Running the Application

### Development Server

```bash
cd C:\wamp64\www\jobprotal\admin-panel
npm start
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## API Configuration

The API base URL is configured using environment variables for easy deployment across different environments.

### Quick Setup

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your API URL:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. Restart the development server if it's running.

### Environment Files

- `.env` - Your local configuration (not committed to git)
- `.env.example` - Template file (committed to git)
- See `ENV_CONFIGURATION.md` for detailed documentation

### Production Deployment

For production, set the environment variable on your hosting platform:

```env
REACT_APP_API_BASE_URL=https://api.yourjobportal.com/api/v1
```

**Note:** After changing environment variables, you must restart the dev server or rebuild for production.

## Default Login

Use the credentials from your backend database. Example:
- Email: `admin@jobportal.com`
- Password: Your configured password

## Project Structure

```
admin-panel/
├── public/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   └── ProtectedRoute.js
│   │   └── layout/          # Layout components
│   │       └── MainLayout.js
│   ├── contexts/            # React contexts
│   │   └── AuthContext.js
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   │   └── Login.js
│   │   ├── dashboard/
│   │   │   └── Dashboard.js
│   │   ├── admins/
│   │   ├── employees/
│   │   ├── employers/
│   │   ├── jobs/
│   │   ├── coupons/
│   │   ├── commissions/
│   │   ├── cv-requests/
│   │   ├── plans/
│   │   └── catalogs/
│   ├── services/            # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── adminService.js
│   ├── App.js              # Main app component
│   └── index.js            # Entry point
└── package.json
```

## Features by Role

### Super Admin
- Full access to all modules
- Admin management
- Coupon management
- View all commissions
- All other modules

### Employee Manager
- Dashboard
- Employee management
- View jobs
- CV requests
- Personal commissions

### Employer Manager
- Dashboard
- Employer management
- View jobs
- Personal commissions

### Plan Upgrade Manager
- Dashboard
- Plan management
- Personal commissions

### Catalog Manager
- Dashboard
- Catalog management (industries, locations, categories)
- Personal commissions

## Known Issues & Warnings

The application compiles with some ESLint warnings related to:
- Unused variables in some imports
- React Hook dependencies

These are non-critical and don't affect functionality. They can be addressed in future updates.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

### Adding New Features

1. Create new page component in `src/pages/[module-name]/`
2. Add route in `src/App.js`
3. Add navigation item in `src/components/layout/MainLayout.js`
4. Add API service methods in `src/services/adminService.js`

### Styling

The application uses Material-UI's theming system. The theme is configured in `src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});
```

### Toast Notifications

Use the `useSnackbar` hook from notistack:

```javascript
import { useSnackbar } from 'notistack';

const { enqueueSnackbar } = useSnackbar();
enqueueSnackbar('Success message', { variant: 'success' });
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, the app will prompt to use another port.

### API Connection Issues
- Ensure the backend API is running at `http://localhost:8000`
- Check CORS settings in the backend
- Verify the API base URL in `src/services/api.js`

### Authentication Issues
- Clear browser localStorage
- Check token expiration
- Verify backend authentication endpoints

## Future Enhancements

- [ ] Implement edit functionality for employees and employers
- [ ] Add bulk operations
- [ ] Export data to CSV/Excel
- [ ] Advanced filtering and sorting
- [ ] Real-time notifications
- [ ] Activity logs
- [ ] User profile management
- [ ] Dark mode toggle
- [ ] Multi-language support

## Support

For issues or questions, please refer to the API documentation at:
`C:\wamp64\www\jobprotal\job-portal-api\ADMIN_PANEL_API_DOCUMENTATION.md`

## Version

**Version:** 1.0.0
**Last Updated:** October 7, 2025
**Status:** Production Ready ✅
