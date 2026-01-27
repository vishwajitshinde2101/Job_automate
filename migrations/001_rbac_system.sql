-- ====================================================================
-- RBAC (Role-Based Access Control) System Migration
-- Created: 2026-01-27
-- Description: Adds comprehensive role and permission management
-- ====================================================================

-- Step 1: Create institute_roles table
-- Stores custom roles per institute (Admin, Teacher, HR, Trainer, etc.)
CREATE TABLE IF NOT EXISTS institute_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institute_id CHAR(36) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    role_key VARCHAR(100) NOT NULL, -- Unique identifier (admin, teacher, hr, etc.)
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    is_system BOOLEAN DEFAULT 0, -- System roles cannot be deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_role_per_institute (institute_id, role_key),
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    INDEX idx_institute_id (institute_id),
    INDEX idx_role_key (role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Create institute_permissions table
-- Stores all available permissions/features
CREATE TABLE IF NOT EXISTS institute_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    permission_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'students.view', 'students.add'
    permission_name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL, -- e.g., 'students', 'staff', 'reports'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_module (module),
    INDEX idx_permission_key (permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Create institute_role_permissions table
-- Maps roles to their permissions
CREATE TABLE IF NOT EXISTS institute_role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_role_permission (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES institute_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES institute_permissions(id) ON DELETE CASCADE,
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Add role_id column to institute_staff table
ALTER TABLE institute_staff
ADD COLUMN role_id BIGINT UNSIGNED NULL AFTER role,
ADD FOREIGN KEY (role_id) REFERENCES institute_roles(id) ON DELETE SET NULL,
ADD INDEX idx_role_id (role_id);

-- Step 5: Add role_id column to institute_students table
ALTER TABLE institute_students
ADD COLUMN role_id BIGINT UNSIGNED NULL AFTER status,
ADD FOREIGN KEY (role_id) REFERENCES institute_roles(id) ON DELETE SET NULL,
ADD INDEX idx_role_id (role_id);

-- ====================================================================
-- SEED DATA: Default Permissions
-- ====================================================================

INSERT INTO institute_permissions (permission_key, permission_name, module, description) VALUES
-- Dashboard Module
('dashboard.view', 'View Dashboard', 'dashboard', 'Access to main dashboard overview'),
('dashboard.analytics', 'View Analytics', 'dashboard', 'Access to detailed analytics and charts'),

-- Student Management Module
('students.view', 'View Students', 'students', 'View student list and details'),
('students.add', 'Add Students', 'students', 'Create new student records'),
('students.edit', 'Edit Students', 'students', 'Update student information'),
('students.delete', 'Delete Students', 'students', 'Remove student records'),
('students.password', 'Change Student Password', 'students', 'Reset or change student passwords'),
('students.export', 'Export Students', 'students', 'Export student data to Excel/CSV'),

-- Staff Management Module
('staff.view', 'View Staff', 'staff', 'View staff list and details'),
('staff.add', 'Add Staff', 'staff', 'Create new staff members'),
('staff.edit', 'Edit Staff', 'staff', 'Update staff information'),
('staff.delete', 'Delete Staff', 'staff', 'Remove staff members'),
('staff.password', 'Change Staff Password', 'staff', 'Reset or change staff passwords'),

-- Attendance Module
('attendance.view', 'View Attendance', 'attendance', 'View attendance records'),
('attendance.mark', 'Mark Attendance', 'attendance', 'Mark student attendance'),
('attendance.edit', 'Edit Attendance', 'attendance', 'Modify attendance records'),
('attendance.reports', 'Attendance Reports', 'attendance', 'Generate attendance reports'),

-- Reports Module
('reports.view', 'View Reports', 'reports', 'Access to reports section'),
('reports.student', 'Student Reports', 'reports', 'Generate student performance reports'),
('reports.staff', 'Staff Reports', 'reports', 'Generate staff activity reports'),
('reports.financial', 'Financial Reports', 'reports', 'View financial and subscription reports'),

-- Settings Module
('settings.view', 'View Settings', 'settings', 'Access to settings page'),
('settings.institute', 'Institute Settings', 'settings', 'Manage institute profile and settings'),
('settings.subscription', 'Subscription Settings', 'settings', 'Manage subscription and billing'),

-- Roles & Permissions Module
('roles.view', 'View Roles', 'roles', 'View roles and permissions'),
('roles.manage', 'Manage Roles', 'roles', 'Create, edit, and delete roles'),
('roles.assign', 'Assign Roles', 'roles', 'Assign roles to users'),

-- Invoice Module
('invoices.view', 'View Invoices', 'invoices', 'View invoice list'),
('invoices.generate', 'Generate Invoices', 'invoices', 'Create new invoices'),
('invoices.download', 'Download Invoices', 'invoices', 'Download invoice PDFs');

-- ====================================================================
-- SEED DATA: Default Roles (to be inserted per institute)
-- Note: These will be created via API when institute is created
-- ====================================================================

-- Example for one institute (you'll create these via API for each institute):
-- INSERT INTO institute_roles (institute_id, role_name, role_key, description, is_system) VALUES
-- ('institute-uuid', 'Institute Admin', 'admin', 'Full access to all features', 1),
-- ('institute-uuid', 'Teacher', 'teacher', 'Can manage students and attendance', 1),
-- ('institute-uuid', 'HR Manager', 'hr', 'Manages staff and generates reports', 1),
-- ('institute-uuid', 'Trainer', 'trainer', 'Can mark attendance and view reports', 1),
-- ('institute-uuid', 'Student', 'student', 'Basic student access', 1);

-- ====================================================================
-- Migration Complete
-- ====================================================================

-- Verification Queries:
-- SELECT * FROM institute_permissions ORDER BY module, permission_key;
-- SELECT * FROM institute_roles WHERE institute_id = 'your-institute-id';
-- SELECT r.role_name, p.permission_name, p.module
-- FROM institute_role_permissions rp
-- JOIN institute_roles r ON rp.role_id = r.id
-- JOIN institute_permissions p ON rp.permission_id = p.id
-- WHERE r.institute_id = 'your-institute-id';
