CREATE TABLE experiments (
  id TEXT PRIMARY KEY, author TEXT NOT NULL, title TEXT NOT NULL, owner TEXT NOT NULL,
  day TEXT NOT NULL, start TEXT NOT NULL, duration INTEGER NOT NULL, state TEXT NOT NULL,
  chemicals TEXT NOT NULL, equipment TEXT NOT NULL, notes TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1, mutation TEXT NOT NULL, created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX experiments_day ON experiments(day, start, id);
--> statement-breakpoint
CREATE TABLE reports (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, name TEXT NOT NULL, detail TEXT NOT NULL,
  reporter TEXT NOT NULL, created_at INTEGER NOT NULL, resolved_at INTEGER,
  experiment_id TEXT, experiment_revision INTEGER
);
--> statement-breakpoint
CREATE INDEX reports_status ON reports(resolved_at, created_at);
--> statement-breakpoint
CREATE TABLE readings (
  measured_at INTEGER PRIMARY KEY, temperature REAL NOT NULL, humidity REAL NOT NULL
);

