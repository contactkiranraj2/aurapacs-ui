-- Create the studies table
CREATE TABLE public.studies (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  patient_id text not null,
  patient_name text not null,
  study_date date not null,
  study_description text null,
  modality character varying(10) not null,
  file_path text null,
  file_size bigint null,
  instance_count integer null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  study_instance_uid text null,
  patient_age text null,
  patient_sex character varying(10) null,
  status text null default 'Uploaded'::text,
  number_of_instances integer null,
  constraint studies_pkey primary key (id),
  constraint studies_study_instance_uid_unique unique (study_instance_uid),
  constraint studies_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
);

-- Add indexes
create index IF not exists idx_studies_user_id on public.studies using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_studies_patient_id on public.studies using btree (patient_id) TABLESPACE pg_default;
create index IF not exists idx_studies_study_date on public.studies using btree (study_date) TABLESPACE pg_default;
create index IF not exists idx_studies_study_instance_uid on public.studies using btree (study_instance_uid) TABLESPACE pg_default;

-- Create placeholder trigger function
CREATE OR REPLACE FUNCTION handle_study_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER on_study_update
BEFORE UPDATE ON studies
FOR EACH ROW
EXECUTE FUNCTION handle_study_update();
