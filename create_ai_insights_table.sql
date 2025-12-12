-- Tạo bảng ai_insights để lưu kết quả phân tích AI
-- Mỗi app có thể có nhiều lần phân tích AI (theo thời gian)

CREATE TABLE IF NOT EXISTS ai_insights (
    id VARCHAR(255) PRIMARY KEY,
    app_id VARCHAR(255) NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    suggestions TEXT[] NOT NULL DEFAULT '{}',
    technical_challenges TEXT[] NOT NULL DEFAULT '{}',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_ai_insights_app_id ON ai_insights(app_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);

-- Tạo unique constraint để mỗi app chỉ có 1 insight mới nhất (optional)
-- Hoặc có thể cho phép nhiều insights theo thời gian
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_insights_app_id_unique ON ai_insights(app_id);






