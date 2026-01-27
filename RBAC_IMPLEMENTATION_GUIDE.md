# 🔐 Role-Based Access Control (RBAC) Implementation Guide

**Created:** 2026-01-27
**Status:** ✅ Backend Complete | ⏳ UI Pending
**Database:** ✅ Migrated
**APIs:** ✅ Fully Functional

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [SQL Migration](#sql-migration)
4. [Backend Models](#backend-models)
5. [API Endpoints](#api-endpoints)
6. [Testing the APIs](#testing-the-apis)
7. [Default Roles & Permissions](#default-roles--permissions)
8. [Next Steps (UI)](#next-steps-ui)

---

## 🎯 Overview

The RBAC system allows Institute Admins to:
- Create custom roles (Teacher, HR, Trainer, Counselor, etc.)
- Define granular permissions for each module
- Assign roles to staff members and students
- Control access to features based on role permissions
- Institute admins have full access to all features

### Key Features
- ✅ 30 pre-defined permissions across 9 modules
- ✅ 4 default roles (Teacher, HR Manager, Trainer, Support Staff)
- ✅ Custom role creation and management
- ✅ Permission-based feature visibility
- ✅ Fine-grained access control

---

## 🗄️ Database Schema

### New Tables Created

#### 1. `institute_roles`
Stores custom roles for each institute

```sql
CREATE TABLE institute_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institute_id CHAR(36) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    role_key VARCHAR(100) NOT NULL,          -- Unique: admin, teacher, hr, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    is_system BOOLEAN DEFAULT 0,              -- System roles can't be deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY (institute_id, role_key),
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
);
```

#### 2. `institute_permissions`
Stores all available permissions (shared across all institutes)

```sql
CREATE TABLE institute_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    permission_key VARCHAR(100) NOT NULL UNIQUE,  -- 'students.view', 'students.add'
    permission_name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,                  -- 'students', 'staff', 'reports'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. `institute_role_permissions`
Junction table mapping roles to permissions

```sql
CREATE TABLE institute_role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES institute_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES institute_permissions(id) ON DELETE CASCADE
);
```

#### 4. Updated Existing Tables

```sql
-- Added role_id column to institute_staff
ALTER TABLE institute_staff
ADD COLUMN role_id BIGINT UNSIGNED NULL AFTER role,
ADD FOREIGN KEY (role_id) REFERENCES institute_roles(id) ON DELETE SET NULL;

-- Added role_id column to institute_students
ALTER TABLE institute_students
ADD COLUMN role_id BIGINT UNSIGNED NULL AFTER status,
ADD FOREIGN KEY (role_id) REFERENCES institute_roles(id) ON DELETE SET NULL;
```

---

## 📦 SQL Migration

**Location:** `/migrations/001_rbac_system.sql`

**To Run Migration:**
```bash
# The migration has already been applied to your database
# But if you need to run it again on a fresh database:

mysql -u admin -p jobautomate < migrations/001_rbac_system.sql
```

**What the Migration Does:**
1. ✅ Creates `institute_roles` table
2. ✅ Creates `institute_permissions` table
3. ✅ Creates `institute_role_permissions` junction table
4. ✅ Adds `role_id` to `institute_staff`
5. ✅ Adds `role_id` to `institute_students`
6. ✅ Seeds 30 default permissions

**Seeded Permissions:**
- Dashboard: 2 permissions
- Students: 6 permissions
- Staff: 5 permissions
- Attendance: 4 permissions
- Reports: 4 permissions
- Settings: 3 permissions
- Roles: 3 permissions
- Invoices: 3 permissions

---

## 🏗️ Backend Models

### New Sequelize Models Created

#### 1. `InstituteRole.js`
```javascript
// Location: server/models/InstituteRole.js
// Manages institute-specific roles
```

#### 2. `InstitutePermission.js`
```javascript
// Location: server/models/InstitutePermission.js
// Stores all available permissions
```

#### 3. `InstituteRolePermission.js`
```javascript
// Location: server/models/InstituteRolePermission.js
// Junction table for many-to-many relationship
```

#### 4. Updated `associations.js`
Added relationships:
```javascript
// Role -> Permissions (many-to-many)
InstituteRole.belongsToMany(InstitutePermission, { through: InstituteRolePermission })

// Staff -> Role (many-to-one)
InstituteStaff.belongsTo(InstituteRole, { as: 'instituteRole' })

// Student -> Role (many-to-one)
InstituteStudent.belongsTo(InstituteRole, { as: 'instituteRole' })
```

---

## 🚀 API Endpoints

### Base URL: `https://api.autojobzy.com/api/rbac` (Local)
### Production: `https://api.autojobzy.com/api/rbac`

---

### 1. Get All Permissions
**GET** `/api/rbac/permissions`

**Authentication:** Required (Institute Admin only)

**Response:**
```json
{
  "success": true,
  "permissions": {
    "dashboard": [
      {
        "id": 1,
        "permissionKey": "dashboard.view",
        "permissionName": "View Dashboard",
        "module": "dashboard",
        "description": "Access to main dashboard overview"
      },
      ...
    ],
    "students": [...],
    "staff": [...],
    "attendance": [...],
    ...
  },
  "totalPermissions": 30
}
```

---

### 2. Get All Roles
**GET** `/api/rbac/roles`

**Authentication:** Required (Institute Admin or Staff)

**Response:**
```json
{
  "success": true,
  "roles": [
    {
      "id": 1,
      "instituteId": "uuid-here",
      "roleName": "Teacher",
      "roleKey": "teacher",
      "description": "Can manage students and attendance",
      "isActive": true,
      "isSystem": true,
      "permissions": [
        {
          "permissionKey": "dashboard.view",
          "permissionName": "View Dashboard",
          ...
        },
        ...
      ]
    },
    ...
  ],
  "totalRoles": 5
}
```

---

### 3. Create Custom Role
**POST** `/api/rbac/roles`

**Authentication:** Required (Institute Admin only)

**Request Body:**
```json
{
  "roleName": "Counselor",
  "roleKey": "counselor",
  "description": "Counsels students and views their data",
  "permissionIds": [1, 2, 7, 8, 9, 28, 29]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "role": {
    "id": 5,
    "roleName": "Counselor",
    "roleKey": "counselor",
    ...
    "permissions": [...]
  }
}
```

---

### 4. Update Role
**PUT** `/api/rbac/roles/:roleId`

**Authentication:** Required (Institute Admin only)

**Request Body:**
```json
{
  "roleName": "Senior Counselor",
  "description": "Updated description",
  "permissionIds": [1, 2, 3, 7, 8, 9, 28, 29],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "role": {...}
}
```

---

### 5. Delete Role
**DELETE** `/api/rbac/roles/:roleId`

**Authentication:** Required (Institute Admin only)

**Note:** Cannot delete system roles or roles assigned to users

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

---

### 6. Get My Permissions
**GET** `/api/rbac/my-permissions`

**Authentication:** Required (Any institute user)

**Response:**
```json
{
  "success": true,
  "permissions": [
    "dashboard.view",
    "students.view",
    "students.add",
    "students.edit",
    ...
  ],
  "role": "Teacher",
  "roleKey": "teacher",
  "hasFullAccess": false
}
```

**Admin Response:**
```json
{
  "success": true,
  "permissions": [
    "dashboard.view",
    "dashboard.analytics",
    "students.view",
    "students.add",
    ...
    // All 30 permissions
  ],
  "role": "admin",
  "hasFullAccess": true
}
```

---

### 7. Assign Role to User
**POST** `/api/rbac/assign-role`

**Authentication:** Required (Institute Admin only)

**Request Body:**
```json
{
  "userId": "user-uuid-here",
  "roleId": 1,
  "userType": "staff"  // or "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "role": "Teacher"
}
```

---

### 8. Initialize Default Roles
**POST** `/api/rbac/initialize-default-roles`

**Authentication:** Required (Institute Admin only)

**Note:** Only needs to be called once per institute. Creates 4 default roles.

**Response:**
```json
{
  "success": true,
  "message": "Default roles initialized successfully",
  "roles": [
    { "roleName": "Teacher", ... },
    { "roleName": "HR Manager", ... },
    { "roleName": "Trainer", ... },
    { "roleName": "Support Staff", ... }
  ]
}
```

---

## 🧪 Testing the APIs

### Complete Test Script

Save this as `test_rbac.sh`:

```bash
#!/bin/bash

BASE_URL="https://api.autojobzy.com/api"

# 1. Admin Login
ADMIN_TOKEN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123"
  }' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Initialize Default Roles
curl -X POST "${BASE_URL}/rbac/initialize-default-roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Get All Permissions
curl -X GET "${BASE_URL}/rbac/permissions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 4. Get All Roles
curl -X GET "${BASE_URL}/rbac/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 5. Create Custom Role
curl -X POST "${BASE_URL}/rbac/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "roleName": "Counselor",
    "roleKey": "counselor",
    "description": "Counsels students",
    "permissionIds": [1, 2, 7, 8, 9]
  }' | jq .

# 6. Get My Permissions
curl -X GET "${BASE_URL}/rbac/my-permissions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 7. Assign Role to Staff
curl -X POST "${BASE_URL}/rbac/assign-role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "staff-user-id",
    "roleId": 1,
    "userType": "staff"
  }' | jq .
```

Run with:
```bash
chmod +x test_rbac.sh && ./test_rbac.sh
```

---

## 🎭 Default Roles & Permissions

### Role 1: Teacher
**Permissions:**
- ✅ dashboard.view
- ✅ students.view, students.add, students.edit, students.password
- ✅ attendance.view, attendance.mark, attendance.edit
- ✅ reports.view, reports.student

**Use Case:** Faculty members who manage students and attendance

---

### Role 2: HR Manager
**Permissions:**
- ✅ dashboard.view, dashboard.analytics
- ✅ staff.view, staff.add, staff.edit
- ✅ students.view, students.export
- ✅ reports.view, reports.staff, reports.student

**Use Case:** HR personnel who manage staff and generate reports

---

### Role 3: Trainer
**Permissions:**
- ✅ dashboard.view
- ✅ students.view
- ✅ attendance.view, attendance.mark
- ✅ reports.view, reports.student

**Use Case:** Training staff who mark attendance and view reports

---

### Role 4: Support Staff
**Permissions:**
- ✅ dashboard.view
- ✅ students.view
- ✅ attendance.view

**Use Case:** Support personnel with read-only access

---

## 📊 Permission Modules

### Dashboard Module
1. `dashboard.view` - View Dashboard
2. `dashboard.analytics` - View Analytics

### Students Module
1. `students.view` - View Students
2. `students.add` - Add Students
3. `students.edit` - Edit Students
4. `students.delete` - Delete Students
5. `students.password` - Change Student Password
6. `students.export` - Export Students

### Staff Module
1. `staff.view` - View Staff
2. `staff.add` - Add Staff
3. `staff.edit` - Edit Staff
4. `staff.delete` - Delete Staff
5. `staff.password` - Change Staff Password

### Attendance Module
1. `attendance.view` - View Attendance
2. `attendance.mark` - Mark Attendance
3. `attendance.edit` - Edit Attendance
4. `attendance.reports` - Attendance Reports

### Reports Module
1. `reports.view` - View Reports
2. `reports.student` - Student Reports
3. `reports.staff` - Staff Reports
4. `reports.financial` - Financial Reports

### Settings Module
1. `settings.view` - View Settings
2. `settings.institute` - Institute Settings
3. `settings.subscription` - Subscription Settings

### Roles Module
1. `roles.view` - View Roles
2. `roles.manage` - Manage Roles
3. `roles.assign` - Assign Roles

### Invoices Module
1. `invoices.view` - View Invoices
2. `invoices.generate` - Generate Invoices
3. `invoices.download` - Download Invoices

---

## 🎨 Next Steps (UI)

### Pending Frontend Work

#### 1. Role Management Component (`RoleManagement.tsx`)
- ⏳ List all roles with permissions
- ⏳ Create/Edit/Delete custom roles
- ⏳ Multi-select permission checkboxes grouped by module
- ⏳ Role assignment to staff/students

#### 2. Dashboard Permission Filtering
- ⏳ Update InstituteAdminDashboard.tsx to check permissions
- ⏳ Show/hide tabs based on user permissions
- ⏳ Disable actions user doesn't have permission for

#### 3. Permission Check Utility
```typescript
// utils/permissions.ts
export const hasPermission = (
  userPermissions: string[],
  required: string | string[]
): boolean => {
  if (Array.isArray(required)) {
    return required.every(p => userPermissions.includes(p));
  }
  return userPermissions.includes(required);
};
```

#### 4. Permission Context Provider
```typescript
// context/PermissionsContext.tsx
export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Fetch user permissions on mount
    fetch('/api/rbac/my-permissions')
      .then(res => res.json())
      .then(data => setPermissions(data.permissions));
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};
```

#### 5. Conditional Rendering Example
```typescript
import { usePermissions } from '../context/PermissionsContext';

const StudentManagement = () => {
  const { permissions } = usePermissions();

  return (
    <div>
      {hasPermission(permissions, 'students.view') && (
        <StudentList />
      )}

      {hasPermission(permissions, 'students.add') && (
        <Button>Add Student</Button>
      )}

      {hasPermission(permissions, 'students.export') && (
        <Button>Export to Excel</Button>
      )}
    </div>
  );
};
```

---

## ✅ Summary

### Completed ✅
1. ✅ Database migration with 4 new tables
2. ✅ 3 Sequelize models (InstituteRole, InstitutePermission, InstituteRolePermission)
3. ✅ Updated associations.js
4. ✅ Complete RBAC API routes (8 endpoints)
5. ✅ Institute auth middleware
6. ✅ 30 permissions seeded across 9 modules
7. ✅ 4 default roles with pre-configured permissions
8. ✅ Tested all APIs successfully

### Pending ⏳
1. ⏳ Role Management UI Component
2. ⏳ Permissions Context Provider
3. ⏳ Dashboard permission-based filtering
4. ⏳ Permission check utilities
5. ⏳ Update existing components to respect permissions

---

## 🔗 Quick Links

- Migration File: `/migrations/001_rbac_system.sql`
- Models: `/server/models/InstituteRole.js`, `InstitutePermission.js`, `InstituteRolePermission.js`
- Routes: `/server/routes/rbac.js`
- Middleware: `/server/middleware/instituteAuth.js`

---

**Created by:** Claude Code
**Date:** 2026-01-27
**Status:** Backend Complete ✅ | UI Pending ⏳
