import { db, nowIso } from "../../infrastructure/db/client.js";
import type { SessionStorageRecord } from "../../domain/session/types.js";

export function insertSession(record: SessionStorageRecord): void {
  const stmt = db.prepare(`
    INSERT INTO sessions (
      id,
      journey_id,
      status,
      current_node_id,
      visited_node_ids_json,
      history_json,
      answers_json,
      derived_json,
      dashboard_json,
      result_json,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @journeyId,
      @status,
      @currentNodeId,
      @visitedNodeIdsJson,
      @historyJson,
      @answersJson,
      @derivedJson,
      @dashboardJson,
      @resultJson,
      @createdAt,
      @updatedAt
    )
  `);

  stmt.run(record);
}

export function updateSession(record: SessionStorageRecord): void {
  const stmt = db.prepare(`
    UPDATE sessions
    SET
      status = @status,
      current_node_id = @currentNodeId,
      visited_node_ids_json = @visitedNodeIdsJson,
      history_json = @historyJson,
      answers_json = @answersJson,
      derived_json = @derivedJson,
      dashboard_json = @dashboardJson,
      result_json = @resultJson,
      updated_at = @updatedAt
    WHERE id = @id
  `);

  stmt.run(record);
}

export function findSessionById(sessionId: string): SessionStorageRecord | null {
  const stmt = db.prepare(`
    SELECT
      id,
      journey_id as journeyId,
      status,
      current_node_id as currentNodeId,
      visited_node_ids_json as visitedNodeIdsJson,
      history_json as historyJson,
      answers_json as answersJson,
      derived_json as derivedJson,
      dashboard_json as dashboardJson,
      result_json as resultJson,
      created_at as createdAt,
      updated_at as updatedAt
    FROM sessions
    WHERE id = ?
  `);

  const row = stmt.get(sessionId);

  if (!row) {
    return null;
  }

  return row as SessionStorageRecord;
}

export function insertAnswer(params: {
  id: string;
  sessionId: string;
  nodeId: string;
  questionKey: string;
  valueJson: string;
  revision: number;
  answeredAt: string;
}): void {
  const stmt = db.prepare(`
    INSERT INTO answers (
      id,
      session_id,
      node_id,
      question_key,
      value_json,
      revision,
      answered_at
    ) VALUES (
      @id,
      @sessionId,
      @nodeId,
      @questionKey,
      @valueJson,
      @revision,
      @answeredAt
    )
  `);

  stmt.run(params);
}

export function getAnswerRevision(sessionId: string, questionKey: string): number {
  const stmt = db.prepare(`
    SELECT MAX(revision) as maxRevision
    FROM answers
    WHERE session_id = ? AND question_key = ?
  `);

  const row = stmt.get(sessionId, questionKey) as { maxRevision: number | null };

  return row?.maxRevision ?? 0;
}

export function touchSession(sessionId: string): void {
  const stmt = db.prepare(`
    UPDATE sessions
    SET updated_at = ?
    WHERE id = ?
  `);

  stmt.run(nowIso(), sessionId);
}
