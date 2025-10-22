# Admin Panel Login Credentials

## Default Super Admin Account

**Login URL:** http://localhost:3000/login

**Email:** admin@jobportal.com
**Password:** password123
**Role:** Super Admin (Full Access)

---

## Additional Admin Accounts (Available via Seeder)

Run `php artisan db:seed --class=AdminSeeder` to create these additional accounts:

### Employee Manager
- **Email:** employee.manager@jobportal.com
- **Password:** password123
- **Access:** Employees, CV Requests, Dashboard

### Employer Manager
- **Email:** employer.manager@jobportal.com
- **Password:** password123
- **Access:** Employers, Jobs, Dashboard

### Plan Manager
- **Email:** plan.manager@jobportal.com
- **Password:** password123
- **Access:** Plans, Dashboard

### Catalog Manager
- **Email:** catalog.manager@jobportal.com
- **Password:** password123
- **Access:** Industries, Locations, Categories, Dashboard

---

## Security Notes

⚠️ **IMPORTANT:** These are default credentials for development only!

**For Production:**
1. Change all passwords immediately
2. Use strong passwords (12+ characters, mixed case, numbers, symbols)
3. Consider implementing 2FA
4. Remove unused admin accounts
5. Update the seeder to use secure passwords

**To Change Password:**
- Login to admin panel
- Navigate to Admin Management (Super Admin only)
- Edit admin and update password

---

## Creating New Admins

### Via Admin Panel (Super Admin Only):
1. Login with super admin account
2. Go to "Admins" in sidebar
3. Click "Add Admin"
4. Fill in details and select role
5. Click "Create"

### Via Artisan Console:
```bash
php artisan tinker
```

```php
App\Models\Admin::create([
    'name' => 'New Admin Name',
    'email' => 'newadmin@example.com',
    'password' => 'secure_password',
    'role' => 'employee_manager' // or other role
]);
```

### Via Database Seeder:
1. Edit `database/seeders/AdminSeeder.php`
2. Add new admin entry
3. Run: `php artisan db:seed --class=AdminSeeder`

---

## Troubleshooting Login Issues

### "Invalid credentials" error:
- Verify email and password are correct
- Check if admin exists: `php artisan tinker --execute="App\Models\Admin::where('email', 'admin@jobportal.com')->first();"`

### "403 Forbidden" after login:
- Logout and login again
- Clear browser localStorage
- Ensure backend API is running

### Backend API not running:
```bash
cd C:\wamp64\www\jobprotal\job-portal-api
php artisan serve
```

---

**Last Updated:** October 7, 2025
