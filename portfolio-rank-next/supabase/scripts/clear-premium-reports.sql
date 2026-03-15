-- Run this in the Supabase SQL editor to clear cached premium reports.
-- Use when testing so the next payment stores a fresh report (with updated AI prompt).
delete from premium_reports;
