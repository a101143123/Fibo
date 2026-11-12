-- Fibo Pro 5.0 D1 schema (deployment required)
CREATE TABLE IF NOT EXISTS daily_prices (symbol TEXT NOT NULL, market TEXT NOT NULL, date TEXT NOT NULL, open REAL NOT NULL, high REAL NOT NULL, low REAL NOT NULL, close REAL NOT NULL, volume INTEGER NOT NULL DEFAULT 0, source TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(symbol,date));
CREATE INDEX IF NOT EXISTS idx_daily_prices_date ON daily_prices(date);
CREATE TABLE IF NOT EXISTS watchlists (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS watchlist_items (watchlist_id TEXT NOT NULL, symbol TEXT NOT NULL, PRIMARY KEY(watchlist_id,symbol), FOREIGN KEY(watchlist_id) REFERENCES watchlists(id));
CREATE TABLE IF NOT EXISTS scan_runs (id TEXT PRIMARY KEY, rule TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS scan_results (run_id TEXT NOT NULL, symbol TEXT NOT NULL, matched INTEGER NOT NULL, close REAL, detail TEXT, PRIMARY KEY(run_id,symbol));
