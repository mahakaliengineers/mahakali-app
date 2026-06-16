-- ============================================================================
-- Mahakali Engineers and Developers Pvt. Ltd. — MySQL 8.0 Schema
-- Generated for Nest Nepal cPanel MySQL deployment
-- Run this file against your MySQL database before starting the application.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `updates`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `milestones`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `photos`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `session`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Table: users
-- ============================================================================
CREATE TABLE `users` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `name`          TEXT NOT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` TEXT NOT NULL,
  `role`          ENUM('client', 'admin', 'super_admin') NOT NULL DEFAULT 'client',
  `phone`         TEXT,
  `site_location` TEXT,
  `fiscal_year`   TEXT,
  `client_number` TEXT,
  `client_code`   TEXT,
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: projects
-- ============================================================================
CREATE TABLE `projects` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `client_id`   INT NOT NULL,
  `title`       TEXT NOT NULL,
  `location`    TEXT,
  `type`        TEXT,
  `status`      ENUM('planning', 'active', 'on_hold', 'completed') NOT NULL DEFAULT 'planning',
  `progress`    INT NOT NULL DEFAULT 0,
  `description` TEXT,
  `start_date`  TIMESTAMP NULL,
  `end_date`    TIMESTAMP NULL,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `projects_client_id_idx` (`client_id`),
  CONSTRAINT `projects_client_id_fk` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: photos
-- ============================================================================
CREATE TABLE `photos` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `project_id`       INT NOT NULL,
  `uploaded_by_id`   INT,
  `url`              TEXT NOT NULL,
  `caption`          TEXT,
  `status`           ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
  `uploaded_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `photos_project_id_idx` (`project_id`),
  KEY `photos_uploaded_by_id_idx` (`uploaded_by_id`),
  CONSTRAINT `photos_project_id_fk`       FOREIGN KEY (`project_id`)     REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `photos_uploaded_by_id_fk`   FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: documents
-- ============================================================================
CREATE TABLE `documents` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `project_id`       INT NOT NULL,
  `uploaded_by_id`   INT,
  `name`             TEXT NOT NULL,
  `url`              TEXT NOT NULL,
  `type`             TEXT NOT NULL DEFAULT 'other',
  `status`           ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
  `uploaded_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `documents_project_id_idx` (`project_id`),
  KEY `documents_uploaded_by_id_idx` (`uploaded_by_id`),
  CONSTRAINT `documents_project_id_fk`     FOREIGN KEY (`project_id`)     REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_uploaded_by_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: comments
-- ============================================================================
CREATE TABLE `comments` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `project_id`  INT NOT NULL,
  `user_id`     INT NOT NULL,
  `message`     TEXT NOT NULL,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `comments_project_id_idx` (`project_id`),
  KEY `comments_user_id_idx` (`user_id`),
  CONSTRAINT `comments_project_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_user_id_fk`    FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: milestones
-- ============================================================================
CREATE TABLE `milestones` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `project_id`   INT NOT NULL,
  `title`        TEXT NOT NULL,
  `description`  TEXT,
  `order`        INT NOT NULL DEFAULT 0,
  `completed_at` TIMESTAMP NULL,
  `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `milestones_project_id_idx` (`project_id`),
  CONSTRAINT `milestones_project_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: payments
-- ============================================================================
CREATE TABLE `payments` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `project_id`  INT NOT NULL,
  `label`       TEXT NOT NULL,
  `amount`      DECIMAL(12, 2) NOT NULL,
  `status`      ENUM('paid', 'pending', 'overdue') NOT NULL DEFAULT 'pending',
  `due_date`    TIMESTAMP NULL,
  `paid_at`     TIMESTAMP NULL,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payments_project_id_idx` (`project_id`),
  CONSTRAINT `payments_project_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: updates
-- ============================================================================
CREATE TABLE `updates` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `project_id`  INT NOT NULL,
  `message`     TEXT NOT NULL,
  `posted_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `updates_project_id_idx` (`project_id`),
  CONSTRAINT `updates_project_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: session (express-mysql-session store)
-- ============================================================================
CREATE TABLE `session` (
  `sid`    VARCHAR(128) NOT NULL,
  `sess`   MEDIUMTEXT NOT NULL,
  `expire` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`sid`),
  KEY `session_expire_idx` (`expire`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Seed: Initial super admin account
-- Password: admin123 (bcrypt hash — regenerate with: node -e "const b=require('bcryptjs');b.hash('admin123',10).then(console.log)")
-- ============================================================================
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`) VALUES
(
  'Mahakali Admin',
  'admin@mahakali.com.np',
  '$2a$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH',
  'super_admin'
);

-- NOTE: Replace the bcrypt hash above with a real one. To generate:
--   node -e "const b=require('bcryptjs'); b.hash('YOUR_PASSWORD',10).then(h => console.log(h))"
-- Or use the /api/portal/auth/login endpoint once the app is running and change
-- via the staff management page.

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
