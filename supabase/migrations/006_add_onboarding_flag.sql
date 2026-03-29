-- Add onboarding completion flag to profiles
alter table profiles
  add column has_completed_onboarding boolean not null default false;
