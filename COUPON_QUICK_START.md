# Coupon Management - Quick Start Guide

## 🚀 Getting Started

### For Staff Members

1. **Create a Coupon**
   - Navigate to "Coupons" in sidebar
   - Click "Create Coupon" button
   - Fill in the form:
     - **Coupon Code**: e.g., SAVE50 (will be auto-uppercase)
     - **Name**: e.g., "50% Discount for Premium Users"
     - **Discount %**: 0-100
     - **Coupon For**: Employee or Employer
     - **Expiry Date**: Must be today or future
   - Click "Create Coupon"
   - Status will be "Pending" until Super Admin approves

2. **View Your Coupons**
   - Navigate to "Coupons" page
   - You'll see only your created coupons
   - Use status filter to see Pending/Approved/Rejected

3. **Assign Users to Approved Coupons**
   - Click "View" (eye icon) on an approved coupon
   - Click "Assign Users" button
   - Enter email or phone number
   - Click "+ Add Another" for multiple users
   - Click "Assign Users"
   - Users can now redeem the coupon!

### For Managers

Same as Staff, plus:
- **View Team Coupons**: See coupons created by your assigned staff
- **Manage Team Coupons**: Assign users to your staff's approved coupons

### For Super Admin

All staff/manager features, plus:

1. **Approve Coupons**
   - Click "Pending Approvals" badge (if any pending)
   - OR go to coupon details page
   - Click "Approve Coupon" or "Reject Coupon"
   - Approved coupons can have users assigned

2. **View All Coupons**
   - See coupons from all staff and managers
   - Filter by status to manage approvals

3. **Delete Coupons**
   - Click delete icon on coupon list
   - Note: Can only delete coupons with no assigned users

## 📋 Common Tasks

### Assigning Multiple Users at Once
```
1. Go to coupon details page
2. Click "Assign Users"
3. Enter first user's email/phone
4. Click "+ Add Another"
5. Enter second user's email/phone
6. Repeat as needed
7. Click "Assign Users"
```

### Checking Who Can Use a Coupon
```
1. Go to coupon details page
2. Scroll to "Assigned Users" table
3. See all users who can redeem the coupon
```

### Removing a User from Coupon
```
1. Go to coupon details page
2. Find user in "Assigned Users" table
3. Click delete icon
4. Confirm removal
```

## 🎯 Workflow Overview

```
CREATE → APPROVE → ASSIGN → REDEEM
  ↓         ↓         ↓         ↓
Staff   Super     Staff    Employee/
        Admin              Employer
```

1. **CREATE**: Staff/Manager creates coupon (status: pending)
2. **APPROVE**: Super Admin approves coupon (status: approved)
3. **ASSIGN**: Staff/Manager assigns users to coupon
4. **REDEEM**: Users can use coupon during plan upgrade

## 🔍 Finding Coupons

### Filter by Status
- **All**: See all your accessible coupons
- **Pending**: Awaiting super admin approval
- **Approved**: Ready for user assignment
- **Rejected**: Not approved for use

### Status Meanings
- 🟠 **Pending**: Awaiting approval
- 🟢 **Approved**: Can assign users
- 🔴 **Rejected**: Not approved

## ⚠️ Important Notes

1. **Coupon Codes**
   - Automatically converted to UPPERCASE
   - Must be unique across all coupons

2. **User Assignment**
   - Only works after coupon is approved
   - Can search by email OR phone number
   - Users must exist in the system

3. **Redemption**
   - Employee coupons: Only for employees
   - Employer coupons: Only for employers
   - Users must be specifically assigned

4. **Deletion**
   - Only Super Admin can delete
   - Cannot delete if users are assigned
   - Must remove all users first

## 💡 Tips & Best Practices

1. **Naming Coupons**
   - Use descriptive names: "Summer Discount for Premium Plans"
   - Helps identify purpose at a glance

2. **Coupon Codes**
   - Keep them memorable: SAVE50, WELCOME25, PREMIUM10
   - Avoid long or complex codes

3. **Expiry Dates**
   - Set reasonable timeframes
   - Check expiry status (green = valid, red = expired)

4. **User Assignment**
   - Assign in bulk to save time
   - Double-check email/phone numbers
   - Review failed assignments in results

5. **For Super Admins**
   - Regularly check pending approvals badge
   - Review coupon details before approving
   - Consider expiry dates when approving

## 🐛 Troubleshooting

### "Cannot assign users to this coupon"
→ Coupon must be approved by Super Admin first

### "User not found"
→ Check if email/phone is correct and user exists in system

### "This coupon is not available for your account"
→ User trying to redeem is not assigned to the coupon

### "Cannot delete coupon with assigned users"
→ Remove all assigned users first, then delete

### "Unauthorized to view this coupon"
→ You don't have permission (staff can only see own coupons)

## 📱 Mobile/Tablet Access

The admin panel is fully responsive:
- All coupon features work on mobile
- Tables scroll horizontally on small screens
- Forms adapt to screen size
- Actions accessible via hamburger menu

## 🆘 Need Help?

- Check the full documentation: `ADMIN_PANEL_INTEGRATION_SUMMARY.md`
- Contact Super Admin for approval issues
- Report bugs to development team

## ✅ Quick Checklist

Before creating a coupon:
- [ ] Choose appropriate coupon code
- [ ] Write clear description
- [ ] Set correct discount percentage
- [ ] Select right user type (employee/employer)
- [ ] Set reasonable expiry date

Before assigning users:
- [ ] Verify coupon is approved
- [ ] Have correct email/phone numbers
- [ ] Check user type matches coupon type
- [ ] Confirm expiry date is still valid

---

**Remember**: Only assigned users can redeem coupons. Always verify user assignments before promoting a coupon!
