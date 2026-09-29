'use client';

import { InfoNote } from '@maxbid/ui/primitives/InfoNote';
import { MonoLabel } from '@maxbid/ui/primitives/MonoLabel';
import { StopLine } from '@maxbid/ui/primitives/StopLine';
import { useEffect } from 'react';
import { STAGES, stageFor, type AnalysisStatus } from '../../../lib/stages';

export type AnalysisProgressProps = {
  status: string;
  progress: number;
  title: string | null;
  sourceUrl: string | null;
  lotCount: number;
};

export function AnalysisProgress({
  status,
  progress,
  title,
  sourceUrl,
  lotCount,
}: AnalysisProgressProps) {
  const stage = stageFor(status as AnalysisStatus);

  // Refresh while there is work happening. A background job has no way to push
  // to this page yet, so the page asks. Web push arrives with F93.
  useEffect(() => {
    if (stage.settled) return;
    const timer = setInterval(() => window.location.reload(), 5000);
    return () => clearInterval(timer);
  }, [stage.settled]);

  return (
    <div className="max-w-2xl">
      <MonoLabel>Analysis</MonoLabel>
      <h1 className="font-sans text-2xl font-bold">{title ?? 'Reading the catalogue'}</h1>
      {sourceUrl ? (
        <p className="mt-1 truncate text-sm text-ink-muted">{sourceUrl}</p>
      ) : null}

      <div className="mt-6" aria-live="polite">
        <p className="font-sans font-semibold">{stage.label}</p>
        <p className="mt-1 text-ink-muted">{stage.detail}</p>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Analysis progress"
        className="mt-4 w-full bg-surface-muted"
      >
        <div style={{ width: `${Math.max(progress, 2)}%` }}>
          <StopLine thickness="thick" />
        </div>
      </div>

      <dl className="mt-6 flex gap-8">
        <div>
          <MonoLabel>Lots read</MonoLabel>
          <dd className="font-sans text-2xl font-bold tabular-nums">{lotCount}</dd>
        </div>
        <div>
          <MonoLabel>Stage</MonoLabel>
          <dd className="font-sans text-2xl font-bold tabular-nums">
            {stage.number} of {STAGES.length}
          </dd>
        </div>
      </dl>

      {stage.settled ? null : (
        <InfoNote className="mt-6">
          You can leave this page. We keep working and this page updates itself.
        </InfoNote>
      )}
    </div>
  );
}
