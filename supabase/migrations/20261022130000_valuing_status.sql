-- An analysis that is being valued is not an analysis that is ready.
--
-- S4 set the status to triaged and then sent the event that starts S5, which
-- runs for another twenty minutes or so. triaged is the status the app reads
-- as finished, so the screen said "Ready for you. Every lot is ranked." while
-- the valuation stage had not started, and the page stopped refreshing itself
-- because there was nothing left to wait for.
--
-- Both halves of that were wrong for the same reason: one status was carrying
-- two meanings. S4 now says valuing, and S5 says triaged when it is done.

alter table public.analyses
  drop constraint if exists analyses_status_check;

alter table public.analyses
  add constraint analyses_status_check
  check (
    status in (
      'queued',
      'extracting',
      'triaging',
      -- Every lot has been identified and we are working out what each one is
      -- worth. The list is readable but the figures are still arriving.
      'valuing',
      'triaged',
      'deep_running',
      'complete',
      'failed'
    )
  );

comment on column public.analyses.status is
  'Where the pipeline has got to. valuing sits between triaging and triaged, because identifying every lot and valuing every lot are different waits.';
