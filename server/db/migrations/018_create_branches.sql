-- ========================================================================
-- MIGRATION 018: Create Branch Tables
-- ========================================================================
-- Purpose: Create institute_branches and branch_managers tables
-- Idempotent: YES - Safe to run multiple times
-- ========================================================================

USE jobautomate;

-- ========================================================================
-- TABLE: institute_branches
-- ========================================================================
CREATE TABLE IF NOT EXISTS institute_branches (
    id CHAR(36) NOT NULL PRIMARY KEY,
    institute_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_institute_id (institute_id),
    CONSTRAINT fk_branch_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: branch_managers
-- ========================================================================
CREATE TABLE IF NOT EXISTS branch_managers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    branch_id CHAR(36) NOT NULL,
    institute_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    added_by CHAR(36) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch_id (branch_id),
    INDEX idx_institute_id (institute_id),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_bm_branch FOREIGN KEY (branch_id) REFERENCES institute_branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_bm_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    CONSTRAINT fk_bm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- UPDATE: Add branch_manager to users role ENUM (if not already there)
-- ========================================================================
-- Check if branch_manager already exists in the enum
-- This is safe to run - ALTER will fail silently if already exists
ALTER TABLE users MODIFY COLUMN role ENUM(
    'user',
    'admin',
    'institute_admin',
    'staff',
    'branch_manager',
    'student',
    'superadmin'
) DEFAULT 'user';
