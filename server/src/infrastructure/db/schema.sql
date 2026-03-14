CREATE TABLE IF NOT EXISTS journeys (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  locale TEXT NOT NULL,
  status TEXT NOT NULL,
  version INTEGER NOT NULL,
  start_node_id TEXT NOT NULL,
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  journey_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_node_id TEXT NOT NULL,
  visited_node_ids_json TEXT NOT NULL,
  history_json TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  derived_json TEXT NOT NULL,
  dashboard_json TEXT NOT NULL,
  result_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (journey_id) REFERENCES journeys(id)
);

CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  question_key TEXT NOT NULL,
  value_json TEXT NOT NULL,
  revision INTEGER NOT NULL,
  answered_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_journey_id
ON sessions (journey_id);

CREATE INDEX IF NOT EXISTS idx_answers_session_id
ON answers (session_id);

CREATE INDEX IF NOT EXISTS idx_answers_session_question_key
ON answers (session_id, question_key);

CREATE TABLE IF NOT EXISTS admin_question_templates (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  slot TEXT NOT NULL,
  input_type TEXT NOT NULL,
  key TEXT NOT NULL,
  title_uk TEXT NOT NULL,
  subtitle_uk TEXT,
  description_uk TEXT,
  option_set_code TEXT,
  node_conditions_json TEXT,
  visibility_conditions_json TEXT,
  dashboard_reveal_templates_json TEXT,
  tags_json TEXT NOT NULL,
  priority INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_option_sets (
  code TEXT PRIMARY KEY,
  options_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_journey_drafts (
  id TEXT PRIMARY KEY,
  journey_id TEXT NOT NULL,
  name TEXT NOT NULL,
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (journey_id) REFERENCES journeys(id)
);
