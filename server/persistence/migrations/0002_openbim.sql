-- Additive openBIM lineage, explicitly applied; never an application startup cutover.
CREATE TABLE source_models (
  project_id text NOT NULL REFERENCES projects(project_id),
  source_model_id text NOT NULL,
  name text NOT NULL,
  current_revision_id text,
  PRIMARY KEY(project_id,source_model_id)
);
CREATE TABLE source_model_revisions (
  project_id text NOT NULL,
  source_model_id text NOT NULL,
  revision_id text NOT NULL,
  prior_revision_id text,
  project_revision_id text NOT NULL,
  artifact_id text NOT NULL,
  evidence_id text NOT NULL,
  status text NOT NULL CHECK(status IN ('IMPORTING','IMPORTED','FAILED')),
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY(project_id,revision_id),
  UNIQUE(project_id,source_model_id,revision_id),
  FOREIGN KEY(project_id,source_model_id) REFERENCES source_models(project_id,source_model_id),
  FOREIGN KEY(project_id,source_model_id,prior_revision_id) REFERENCES source_model_revisions(project_id,source_model_id,revision_id),
  FOREIGN KEY(project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id),
  FOREIGN KEY(project_id,artifact_id) REFERENCES artifacts(project_id,artifact_id),
  FOREIGN KEY(project_id,evidence_id) REFERENCES evidence(project_id,evidence_id)
);
ALTER TABLE source_models ADD CONSTRAINT source_model_head_fk FOREIGN KEY(project_id,source_model_id,current_revision_id)
  REFERENCES source_model_revisions(project_id,source_model_id,revision_id) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE model_entity_mappings (
  project_id text NOT NULL,
  revision_id text NOT NULL,
  express_id integer NOT NULL CHECK(express_id>0),
  entity_id text NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY(project_id,revision_id,express_id),
  UNIQUE(project_id,revision_id,entity_id),
  FOREIGN KEY(project_id,revision_id) REFERENCES source_model_revisions(project_id,revision_id),
  FOREIGN KEY(project_id,entity_id) REFERENCES entities(project_id,entity_id)
);
CREATE TABLE model_diffs (
  project_id text NOT NULL,
  revision_id text NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY(project_id,revision_id),
  FOREIGN KEY(project_id,revision_id) REFERENCES source_model_revisions(project_id,revision_id)
);
CREATE FUNCTION hermes_import_terminal_transition() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'immutable model revision cannot be deleted'; END IF;
  IF OLD.status<>'IMPORTING' OR NEW.status NOT IN ('IMPORTED','FAILED') OR
     (to_jsonb(OLD)-'status'-'payload')<>(to_jsonb(NEW)-'status'-'payload') OR
     (OLD.payload-'status'-'report'-'normalized'-'mappings'-'diff'-'normalizedArtifact'-'reportArtifact')<>(NEW.payload-'status'-'report'-'normalized'-'mappings'-'diff'-'normalizedArtifact'-'reportArtifact') THEN
    RAISE EXCEPTION 'immutable model revision or invalid terminal transition';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER model_revision_terminal BEFORE UPDATE OR DELETE ON source_model_revisions FOR EACH ROW EXECUTE FUNCTION hermes_import_terminal_transition();
CREATE TRIGGER model_mapping_immutable BEFORE UPDATE OR DELETE ON model_entity_mappings FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
CREATE TRIGGER model_diff_immutable BEFORE UPDATE OR DELETE ON model_diffs FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
