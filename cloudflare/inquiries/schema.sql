CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reviewed_at TEXT,
  topic TEXT NOT NULL,
  email TEXT NOT NULL,
  piece TEXT NOT NULL,
  order_number TEXT NOT NULL,
  message TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS inquiries_review_queue ON inquiries(reviewed_at, received_at DESC);

CREATE VIEW IF NOT EXISTS pending_inquiries AS
SELECT id, received_at, topic, email, piece, order_number, message
FROM inquiries
WHERE reviewed_at IS NULL
ORDER BY received_at DESC, id DESC;

CREATE TABLE IF NOT EXISTS inquiry_rate (
  bucket INTEGER NOT NULL,
  client_key TEXT NOT NULL,
  submissions INTEGER NOT NULL,
  PRIMARY KEY (bucket, client_key)
);
