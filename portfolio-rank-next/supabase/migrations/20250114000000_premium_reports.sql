-- Premium reports: stores analysis payload keyed by reportKey (analysis_id) before checkout.
-- Required for /api/store-report and /api/premium-report after Stripe redirect.
create table if not exists premium_reports (
  id text primary key,
  report jsonb not null,
  created_at timestamptz default now()
);

comment on table premium_reports is 'Stored report payload for premium page; id = reportKey (UUID) from checkout flow.';
