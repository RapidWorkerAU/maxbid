-- Functions the tables themselves depend on.
--
-- This migration runs before the tables, so nothing here may reference one.
-- Everything that reads a table lives in the functions migration, which runs
-- after them.

-- Keeps updated_at honest without every caller remembering to set it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
