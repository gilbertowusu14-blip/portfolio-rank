-- Site-wide analytics: single row counter for marketing / social proof.
create table if not exists analytics (
  id int primary key check (id = 1),
  total_analyses int not null default 2000
);

insert into analytics (id, total_analyses) values (1, 2000)
on conflict (id) do nothing;

comment on table analytics is 'Single-row counters; id must be 1.';

-- Atomic increment for POST /api/analyze success (service role).
create or replace function increment_total_analyses()
returns void
language plpgsql
security invoker
as $$
begin
  update analytics set total_analyses = total_analyses + 1 where id = 1;
end;
$$;
