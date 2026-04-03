-- Add quiz results JSONB column to profiles
alter table profiles
  add column quiz_results jsonb;
