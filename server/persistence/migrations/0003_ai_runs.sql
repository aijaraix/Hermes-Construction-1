-- Explicit additive migration. AI observations/proposals never confer promotion authority.
CREATE TABLE ai_runs (
  project_id text NOT NULL,
  run_id text NOT NULL,
  project_revision_id text NOT NULL,
  event_id text NOT NULL,
  capability text NOT NULL,
  execution_status text NOT NULL,
  content_hash text NOT NULL CHECK(content_hash ~ '^[a-f0-9]{64}$'),
  payload jsonb NOT NULL,
  PRIMARY KEY(project_id,run_id),
  FOREIGN KEY(project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id),
  FOREIGN KEY(project_id,event_id) REFERENCES events(project_id,event_id)
);
CREATE TABLE ai_tool_calls (
  project_id text NOT NULL,
  tool_call_id text NOT NULL,
  run_id text NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY(project_id,tool_call_id),
  UNIQUE(project_id,run_id,tool_call_id),
  FOREIGN KEY(project_id,run_id) REFERENCES ai_runs(project_id,run_id)
);
CREATE TABLE ai_run_input_refs (
  project_id text NOT NULL,
  run_id text NOT NULL,
  ref_id text NOT NULL,
  evidence_id text,
  source_id text,
  chunk_ref text,
  PRIMARY KEY(project_id,run_id,ref_id),
  CHECK(num_nonnulls(evidence_id,source_id,chunk_ref)=1),
  FOREIGN KEY(project_id,run_id) REFERENCES ai_runs(project_id,run_id),
  FOREIGN KEY(project_id,evidence_id) REFERENCES evidence(project_id,evidence_id),
  FOREIGN KEY(project_id,source_id) REFERENCES sources(project_id,source_id)
);
CREATE TABLE ai_run_output_refs (
  project_id text NOT NULL,
  run_id text NOT NULL,
  ref_id text NOT NULL,
  tool_call_id text,
  claim_id text,
  artifact_id text,
  evidence_id text,
  PRIMARY KEY(project_id,run_id,ref_id),
  CHECK(num_nonnulls(claim_id,artifact_id,evidence_id)=1),
  FOREIGN KEY(project_id,run_id) REFERENCES ai_runs(project_id,run_id),
  FOREIGN KEY(project_id,run_id,tool_call_id) REFERENCES ai_tool_calls(project_id,run_id,tool_call_id),
  FOREIGN KEY(project_id,claim_id) REFERENCES claims(project_id,claim_id),
  FOREIGN KEY(project_id,artifact_id) REFERENCES artifacts(project_id,artifact_id),
  FOREIGN KEY(project_id,evidence_id) REFERENCES evidence(project_id,evidence_id)
);
CREATE TRIGGER ai_runs_immutable BEFORE UPDATE OR DELETE ON ai_runs FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
CREATE TRIGGER ai_tools_immutable BEFORE UPDATE OR DELETE ON ai_tool_calls FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
CREATE TRIGGER ai_inputs_immutable BEFORE UPDATE OR DELETE ON ai_run_input_refs FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
CREATE TRIGGER ai_outputs_immutable BEFORE UPDATE OR DELETE ON ai_run_output_refs FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
