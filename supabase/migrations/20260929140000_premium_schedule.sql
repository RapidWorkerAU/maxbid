-- The buyer's premium becomes a schedule. Decision record 0015.
--
-- A single percentage could not describe the first real auction we read. The
-- Grays Perth motor vehicle sale charges a fixed $495 below $2,000, $650 to
-- $5,000 and $710 to $10,000, and only then switches to percentages. Across
-- the 36 lots in that sale the effective rate ran from 7 percent to 160
-- percent, so numeric(6, 4) cannot hold it.
--
-- The shape stored here matches PremiumSchedule in packages/calc:
--
--   {"includesGst": true,
--    "bands": [{"upTo": 2000, "kind": "fixed", "amount": 495},
--              {"upTo": null, "kind": "rate", "rate": 0.05}]}
--
-- An auction charging one percentage everywhere is a schedule holding one
-- band, so nothing needs a special case.

-- A schedule decides what a user is advised to bid, so a malformed one is
-- refused at the door rather than left for the calculator to find.
create or replace function public.is_valid_premium_schedule(schedule jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  bands jsonb;
  band jsonb;
  count_bands int;
  index int;
  upper_limit jsonb;
  previous numeric := 0;
  amount numeric;
begin
  if schedule is null then
    return true;
  end if;

  if jsonb_typeof(schedule) <> 'object' then
    return false;
  end if;

  -- Whether the stated amounts already include GST. Decision record 0016.
  -- Optional, because most schedules quote a figure before tax, but it must
  -- be a plain true or false when it is there: a string would read as true
  -- everywhere it is used and silently change what a buyer is charged.
  if schedule -> 'includesGst' is not null
     and jsonb_typeof(schedule -> 'includesGst') not in ('boolean', 'null') then
    return false;
  end if;

  bands := schedule -> 'bands';
  if bands is null or jsonb_typeof(bands) <> 'array' then
    return false;
  end if;

  count_bands := jsonb_array_length(bands);
  if count_bands < 1 then
    return false;
  end if;

  for index in 0 .. count_bands - 1 loop
    band := bands -> index;
    if jsonb_typeof(band) <> 'object' then
      return false;
    end if;

    -- The amount has to match the kind, so a rate cannot be read as dollars.
    --
    -- Each test names the key explicitly rather than comparing a type that
    -- may be missing. jsonb_typeof of an absent key is SQL null, and plpgsql
    -- treats a null condition as false, so "typeof <> number" would wave a
    -- missing key straight through.
    if band ->> 'kind' = 'fixed' then
      if band -> 'amount' is null or jsonb_typeof(band -> 'amount') <> 'number' then
        return false;
      end if;
      amount := (band ->> 'amount')::numeric;
    elsif band ->> 'kind' = 'rate' then
      if band -> 'rate' is null or jsonb_typeof(band -> 'rate') <> 'number' then
        return false;
      end if;
      amount := (band ->> 'rate')::numeric;
    else
      return false;
    end if;

    if amount is null or amount < 0 then
      return false;
    end if;

    upper_limit := band -> 'upTo';

    -- Only the last band may run to infinity. Without that, a lot priced
    -- above the last limit would carry no premium at all, which would read
    -- as a free premium rather than as an unreadable schedule.
    if index = count_bands - 1 then
      if upper_limit is not null and jsonb_typeof(upper_limit) <> 'null' then
        return false;
      end if;
    else
      if upper_limit is null or jsonb_typeof(upper_limit) <> 'number' then
        return false;
      end if;
      if (upper_limit #>> '{}')::numeric <= previous then
        return false;
      end if;
      previous := (upper_limit #>> '{}')::numeric;
    end if;
  end loop;

  return true;
end;
$$;

comment on function public.is_valid_premium_schedule (jsonb) is
  'True when a premium schedule can be read without ambiguity. Mirrors assertValidSchedule in packages/calc.';

alter table public.auction_platforms
  add column default_premium_schedule jsonb
    constraint auction_platforms_default_premium_schedule_valid
    check (public.is_valid_premium_schedule(default_premium_schedule));

alter table public.auctions
  add column premium_schedule jsonb
    constraint auctions_premium_schedule_valid
    check (public.is_valid_premium_schedule(premium_schedule));

alter table public.analyses
  add column premium_override_schedule jsonb
    constraint analyses_premium_override_schedule_valid
    check (public.is_valid_premium_schedule(premium_override_schedule));

-- Carry across anything already stored as a single rate. Each becomes a
-- schedule of one band, which is exactly what it meant.
update public.auction_platforms
set default_premium_schedule =
  jsonb_build_object(
    'bands',
    jsonb_build_array(
      jsonb_build_object('upTo', null, 'kind', 'rate', 'rate', default_premium_pct)
    )
  )
where default_premium_pct is not null;

update public.auctions
set premium_schedule =
  jsonb_build_object(
    'bands',
    jsonb_build_array(jsonb_build_object('upTo', null, 'kind', 'rate', 'rate', premium_pct))
  )
where premium_pct is not null;

update public.analyses
set premium_override_schedule =
  jsonb_build_object(
    'bands',
    jsonb_build_array(
      jsonb_build_object('upTo', null, 'kind', 'rate', 'rate', premium_override_pct)
    )
  )
where premium_override_pct is not null;

alter table public.auction_platforms drop column default_premium_pct;
alter table public.auctions drop column premium_pct;
alter table public.analyses drop column premium_override_pct;

comment on column public.auctions.premium_schedule is
  'The buyer premium this auction charges, as bands. Decision record 0015. Null means it has not been read yet.';
