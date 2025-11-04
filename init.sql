CREATE TABLE IF NOT EXISTS votes (
    id VARCHAR(255) PRIMARY KEY,
    count INT NOT NULL DEFAULT 0
);

INSERT INTO votes (id, count) VALUES ('cats', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO votes (id, count) VALUES ('dogs', 0) ON CONFLICT (id) DO NOTHING;
