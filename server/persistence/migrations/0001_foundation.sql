-- Additive foundation only. Applied explicitly, never at ordinary runtime startup.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE organizations (
  organization_id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE projects (
  project_id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organizations(organization_id),
  name text NOT NULL,
  status text NOT NULL,
  current_revision_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  UNIQUE (organization_id, project_id)
);
CREATE TABLE project_revisions (
  project_id text NOT NULL REFERENCES projects(project_id),
  revision_id text NOT NULL,
  revision_index integer NOT NULL CHECK (revision_index >= 0),
  supersedes_revision_id text,
  source_event_id text,
  valid_from timestamptz,
  valid_to timestamptz,
  recorded_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id, revision_id),
  UNIQUE (project_id, revision_index),
  FOREIGN KEY (project_id, supersedes_revision_id) REFERENCES project_revisions(project_id, revision_id) DEFERRABLE INITIALLY DEFERRED,
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to > valid_from)
);
ALTER TABLE projects ADD CONSTRAINT projects_current_revision_fk FOREIGN KEY (project_id,current_revision_id)
  REFERENCES project_revisions(project_id,revision_id) DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE entities (
  project_id text NOT NULL REFERENCES projects(project_id),
  entity_id text NOT NULL,
  entity_class text NOT NULL,
  name text,
  current_revision_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,entity_id)
);
CREATE TABLE entity_revisions (
  project_id text NOT NULL,
  entity_id text NOT NULL,
  entity_revision_id text NOT NULL,
  project_revision_id text NOT NULL,
  revision_index integer NOT NULL CHECK (revision_index >= 0),
  supersedes_revision_id text,
  source_event_id text,
  valid_from timestamptz,
  valid_to timestamptz,
  recorded_at timestamptz NOT NULL,
  revision jsonb NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,entity_revision_id),
  UNIQUE (project_id,entity_id,entity_revision_id),
  UNIQUE (project_id,entity_id,revision_index),
  FOREIGN KEY (project_id,entity_id) REFERENCES entities(project_id,entity_id),
  FOREIGN KEY (project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id),
  FOREIGN KEY (project_id,entity_id,supersedes_revision_id) REFERENCES entity_revisions(project_id,entity_id,entity_revision_id) DEFERRABLE INITIALLY DEFERRED,
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to > valid_from)
);
ALTER TABLE entities ADD CONSTRAINT entities_current_revision_fk FOREIGN KEY (project_id,entity_id,current_revision_id)
  REFERENCES entity_revisions(project_id,entity_id,entity_revision_id) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE external_identities (
  project_id text NOT NULL,
  entity_id text NOT NULL,
  system text NOT NULL,
  source_scope text NOT NULL DEFAULT '',
  external_id text NOT NULL,
  source_revision_id text,
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,system,source_scope,external_id),
  FOREIGN KEY (project_id,entity_id) REFERENCES entities(project_id,entity_id)
);

CREATE TABLE spatial_frames (
  project_id text NOT NULL,
  frame_id text NOT NULL,
  project_revision_id text NOT NULL,
  parent_frame_id text,
  frame_kind text NOT NULL,
  unit text NOT NULL CHECK (unit = 'METER'),
  crs text,
  geodetic_origin geometry(PointZ,4326),
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,frame_id),
  FOREIGN KEY (project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id),
  FOREIGN KEY (project_id,parent_frame_id) REFERENCES spatial_frames(project_id,frame_id),
  CHECK (geodetic_origin IS NULL OR (frame_kind = 'GEODETIC' AND crs = 'EPSG:4326')),
  CHECK (crs IS NULL OR frame_kind IN ('GEODETIC','PROJECT_SURVEY'))
);
CREATE TABLE events (
  project_id text NOT NULL REFERENCES projects(project_id),
  event_id text NOT NULL,
  attempt_id text NOT NULL DEFAULT '',
  sequence bigint NOT NULL CHECK (sequence >= 0),
  trace_id text,
  event_type text NOT NULL,
  project_revision_id text,
  actor jsonb NOT NULL,
  affected_entity_ids text[] NOT NULL,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,event_id),
  UNIQUE (project_id,attempt_id,sequence),
  FOREIGN KEY (project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id) DEFERRABLE INITIALLY DEFERRED
);
-- Enforce append-only history even if an ordinary SQL caller tries to replace it.
CREATE FUNCTION hermes_immutable_row() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'immutable canonical history cannot be updated or deleted'; END; $$;
CREATE TRIGGER events_immutable BEFORE UPDATE OR DELETE ON events FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
CREATE TRIGGER project_revisions_immutable BEFORE UPDATE OR DELETE ON project_revisions FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
CREATE TRIGGER entity_revisions_immutable BEFORE UPDATE OR DELETE ON entity_revisions FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
ALTER TABLE project_revisions ADD CONSTRAINT project_revision_source_event_fk FOREIGN KEY(project_id,source_event_id)
  REFERENCES events(project_id,event_id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE entity_revisions ADD CONSTRAINT entity_revision_source_event_fk FOREIGN KEY(project_id,source_event_id)
  REFERENCES events(project_id,event_id) DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE sources (
  project_id text NOT NULL REFERENCES projects(project_id),
  source_id text NOT NULL,
  source_type text NOT NULL,
  authority_class text NOT NULL,
  license_status text NOT NULL,
  rights_classification text NOT NULL,
  storage_policy jsonb NOT NULL,
  title text NOT NULL,
  owner_or_maintainer text,
  uri text,
  edition_version text,
  jurisdiction text,
  geographic_scope text,
  effective_from timestamptz,
  effective_to timestamptz,
  last_checked timestamptz,
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,source_id)
);
CREATE TABLE artifacts (
  project_id text NOT NULL REFERENCES projects(project_id),
  artifact_id text NOT NULL,
  project_revision_id text,
  source_id text,
  evidence_id text,
  artifact_class text NOT NULL,
  object_key text NOT NULL,
  uri text NOT NULL,
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
  mime_type text NOT NULL,
  rights_classification text NOT NULL,
  confidentiality text,
  immutable boolean NOT NULL CHECK (immutable),
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,artifact_id),
  UNIQUE (project_id,object_key),
  FOREIGN KEY (project_id,source_id) REFERENCES sources(project_id,source_id),
  FOREIGN KEY (project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id)
);
CREATE TABLE evidence (
  project_id text NOT NULL,
  evidence_id text NOT NULL,
  source_id text NOT NULL,
  project_revision_id text NOT NULL,
  artifact_id text,
  artifact_hash text,
  artifact_uri text,
  mime_type text,
  spatial_frame_id text,
  related_entity_ids text[] NOT NULL,
  author_or_device text,
  reality_class text NOT NULL,
  rights_classification text NOT NULL,
  content_kind text NOT NULL,
  observed_at timestamptz,
  captured_at timestamptz,
  recorded_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,evidence_id),
  FOREIGN KEY (project_id,source_id) REFERENCES sources(project_id,source_id),
  FOREIGN KEY (project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id),
  FOREIGN KEY (project_id,spatial_frame_id) REFERENCES spatial_frames(project_id,frame_id),
  FOREIGN KEY (project_id,artifact_id) REFERENCES artifacts(project_id,artifact_id) DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE artifacts ADD CONSTRAINT artifacts_evidence_fk FOREIGN KEY (project_id,evidence_id)
  REFERENCES evidence(project_id,evidence_id) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE claims (
  project_id text NOT NULL,
  claim_id text NOT NULL,
  subject_entity_id text,
  subject_project_id text,
  project_revision_id text NOT NULL,
  entity_revision_id text,
  domain text NOT NULL,
  predicate text NOT NULL,
  value jsonb NOT NULL,
  units text,
  derivation_method text NOT NULL,
  authority_class text NOT NULL,
  reality_class text NOT NULL,
  status text NOT NULL CHECK (status IN ('PROPOSED','OBSERVED','CALCULATED','VERIFIED','REJECTED','STALE','SUPERSEDED','PROFESSIONAL_REVIEW_REQUIRED')),
  valid_from timestamptz,
  valid_to timestamptz,
  recorded_at timestamptz NOT NULL,
  promoted_by text,
  promotion_event_id text,
  supersedes_claim_id text,
  superseded_by_claim_id text,
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,claim_id),
  FOREIGN KEY (project_id,subject_entity_id) REFERENCES entities(project_id,entity_id),
  FOREIGN KEY (subject_project_id) REFERENCES projects(project_id),
  CHECK ((subject_entity_id IS NOT NULL) <> (subject_project_id IS NOT NULL)),
  CHECK (subject_project_id IS NULL OR subject_project_id = project_id),
  FOREIGN KEY (project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id),
  FOREIGN KEY (project_id,subject_entity_id,entity_revision_id) REFERENCES entity_revisions(project_id,entity_id,entity_revision_id),
  FOREIGN KEY (project_id,promotion_event_id) REFERENCES events(project_id,event_id),
  FOREIGN KEY (project_id,supersedes_claim_id) REFERENCES claims(project_id,claim_id) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (project_id,superseded_by_claim_id) REFERENCES claims(project_id,claim_id) DEFERRABLE INITIALLY DEFERRED,
  CHECK (status <> 'VERIFIED' OR (promotion_event_id IS NOT NULL AND promoted_by IS NOT NULL))
);
CREATE INDEX claims_subject_idx ON claims(project_id,subject_entity_id);
CREATE TABLE claim_evidence (
  project_id text NOT NULL,
  claim_id text NOT NULL,
  evidence_id text NOT NULL,
  PRIMARY KEY (project_id,claim_id,evidence_id),
  FOREIGN KEY (project_id,claim_id) REFERENCES claims(project_id,claim_id),
  FOREIGN KEY (project_id,evidence_id) REFERENCES evidence(project_id,evidence_id)
);
CREATE TABLE spatial_transforms (
  project_id text NOT NULL,
  transform_id text NOT NULL,
  from_frame_id text NOT NULL,
  to_frame_id text NOT NULL,
  project_revision_id text,
  evidence_id text,
  translation_meters jsonb NOT NULL,
  orientation jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL,
  PRIMARY KEY (project_id,transform_id),
  FOREIGN KEY (project_id,from_frame_id) REFERENCES spatial_frames(project_id,frame_id),
  FOREIGN KEY (project_id,to_frame_id) REFERENCES spatial_frames(project_id,frame_id),
  FOREIGN KEY (project_id,project_revision_id) REFERENCES project_revisions(project_id,revision_id),
  FOREIGN KEY (project_id,evidence_id) REFERENCES evidence(project_id,evidence_id)
);
CREATE TRIGGER sources_immutable BEFORE UPDATE OR DELETE ON sources FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
CREATE TRIGGER evidence_immutable BEFORE UPDATE OR DELETE ON evidence FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
CREATE TRIGGER artifacts_immutable BEFORE UPDATE OR DELETE ON artifacts FOR EACH ROW EXECUTE FUNCTION hermes_immutable_row();
