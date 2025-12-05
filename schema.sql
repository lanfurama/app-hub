-- Tạo database
CREATE DATABASE app_hub;

-- Kết nối vào database
\c app_hub;

-- Tạo ENUM types
CREATE TYPE feedback_type AS ENUM ('BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER');
CREATE TYPE feedback_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- Tạo bảng apps (từ AppData interface)
CREATE TABLE apps (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    created_at BIGINT NOT NULL,
    thumbnail_url VARCHAR(500),
    ai_insights TEXT
);

-- Tạo bảng feedback (từ Feedback interface)
CREATE TABLE feedback (
    id VARCHAR(255) PRIMARY KEY,
    app_id VARCHAR(255) NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    type feedback_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    votes INTEGER NOT NULL DEFAULT 0,
    status feedback_status NOT NULL DEFAULT 'OPEN',
    author VARCHAR(255) NOT NULL
);

-- Tạo indexes để tối ưu hiệu suất truy vấn
CREATE INDEX idx_feedback_app_id ON feedback(app_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_type ON feedback(type);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_apps_created_at ON apps(created_at DESC);

-- Tạo index cho tech_stack array (để tìm kiếm theo tech stack)
CREATE INDEX idx_apps_tech_stack ON apps USING GIN(tech_stack);

