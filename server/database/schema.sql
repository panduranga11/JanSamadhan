-- ============================================================
-- JanSamadhan Database Schema v2.0
-- Engine: InnoDB | Charset: UTF8MB4
-- Run order matters (foreign key dependencies)
-- ============================================================

CREATE DATABASE IF NOT EXISTS jansamadhan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jansamadhan;

-- -----------------------------------------------------------
-- 1. departments
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  head_name   VARCHAR(100),
  is_active   TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- 2. categories (references departments)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  department_id INT UNSIGNED,
  icon          VARCHAR(50),
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: initial categories
INSERT IGNORE INTO categories (name, icon) VALUES
  ('Roads & Transport',   'road'),
  ('Electricity',         'bolt'),
  ('Water Supply',        'droplet'),
  ('Sanitation & Garbage','trash'),
  ('Other',               'tag');

-- -----------------------------------------------------------
-- 3. users
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)  PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  address       TEXT,
  password      VARCHAR(255),
  google_id     VARCHAR(100) UNIQUE,
  auth_provider ENUM('local','google','both') DEFAULT 'local',
  role          ENUM('user','admin','super_admin') DEFAULT 'user',
  department    VARCHAR(100),
  status        ENUM('active','inactive','banned') DEFAULT 'active',
  avatar_url    VARCHAR(500),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- 4. complaints (references users, categories, departments)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id              VARCHAR(36)  PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  description     TEXT         NOT NULL,
  category_id     INT UNSIGNED NOT NULL,
  department_id   INT UNSIGNED,
  location        VARCHAR(500) NOT NULL,
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  status          ENUM('Pending','In Progress','Resolved','Rejected') DEFAULT 'Pending',
  user_id         VARCHAR(36)  NOT NULL,
  assigned_admin  VARCHAR(36),
  rejection_note  TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_admin) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id)    REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (department_id)  REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- 5. complaint_images (references complaints)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_images (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  complaint_id  VARCHAR(36) NOT NULL,
  image_url     VARCHAR(500) NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- 6. complaint_timeline (references complaints, users)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_timeline (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  complaint_id  VARCHAR(36) NOT NULL,
  status        VARCHAR(50) NOT NULL,
  note          TEXT,
  changed_by    VARCHAR(36) NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by)   REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- 7. complaint_ratings (references complaints, users)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_ratings (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  complaint_id  VARCHAR(36) NOT NULL UNIQUE,
  user_id       VARCHAR(36) NOT NULL,
  rating        TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback      TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- 8. chat_messages (references users)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  message     TEXT NOT NULL,
  is_deleted  TINYINT(1) DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- 9. admin_logs (references users)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_logs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id    VARCHAR(36) NOT NULL,
  action      VARCHAR(200) NOT NULL,
  target_type VARCHAR(50),
  target_id   VARCHAR(36),
  meta        JSON,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- 10. notifications (references users)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  type        VARCHAR(50) NOT NULL,
  message     TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  ref_id      VARCHAR(36),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------
-- Indexes — compatible with all MySQL 8.x versions
-- Uses a helper procedure to skip if index already exists
-- -----------------------------------------------------------

DROP PROCEDURE IF EXISTS CreateIndexIfNotExists;

DELIMITER ;;
CREATE PROCEDURE CreateIndexIfNotExists(
  IN tbl  VARCHAR(64),
  IN idx  VARCHAR(64),
  IN col  TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = tbl
      AND INDEX_NAME   = idx
  ) THEN
    SET @sql = CONCAT('CREATE INDEX ', idx, ' ON ', tbl, ' (', col, ')');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END;;
DELIMITER ;

CALL CreateIndexIfNotExists('complaints',        'idx_complaints_user_id',  'user_id');
CALL CreateIndexIfNotExists('complaints',        'idx_complaints_status',   'status');
CALL CreateIndexIfNotExists('complaints',        'idx_complaints_category', 'category_id');
CALL CreateIndexIfNotExists('complaint_timeline','idx_timeline_complaint',  'complaint_id');
CALL CreateIndexIfNotExists('notifications',     'idx_notifications_user',  'user_id, is_read');
CALL CreateIndexIfNotExists('chat_messages',     'idx_chat_created',        'created_at');
CALL CreateIndexIfNotExists('users',             'idx_users_google_id',     'google_id');

DROP PROCEDURE IF EXISTS CreateIndexIfNotExists;

