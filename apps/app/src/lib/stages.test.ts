import { describe, expect, it } from 'vitest';
import { STAGES, stageFor, type AnalysisStatus } from './stages';

const EVERY: AnalysisStatus[] = [...STAGES, 'failed'];

describe('every status a user can land on', () => {
  it('has a label and a plain explanation', () => {
    for (const status of EVERY) {
      const stage = stageFor(status);
      expect(stage.label.length, status).toBeGreaterThan(0);
      // WR08. A heading is followed by a sentence that explains it.
      expect(stage.detail.endsWith('.'), status).toBe(true);
    }
  });

  it('never blames the user when something failed', () => {
    const detail = stageFor('failed').detail.toLowerCase();
    expect(detail).not.toContain('you did');
    expect(detail).toContain('nothing was charged');
  });

  it('offers the PDF route when extraction failed', () => {
    // F05 and decision record 0012 both fall back to a PDF upload.
    expect(stageFor('failed').detail).toContain('PDF');
  });
});

describe('knowing when to stop refreshing', () => {
  it('keeps waiting while work is happening', () => {
    for (const status of ['queued', 'extracting', 'triaging', 'deep_running'] as const) {
      expect(stageFor(status).settled, status).toBe(false);
    }
  });

  it('settles when the user has to act, or there is nothing left', () => {
    for (const status of ['triaged', 'complete', 'failed'] as const) {
      expect(stageFor(status).settled, status).toBe(true);
    }
  });
});

describe('the stage number', () => {
  it('counts from one', () => {
    expect(stageFor('queued').number).toBe(1);
    expect(stageFor('extracting').number).toBe(2);
  });

  it('reports the last stage for a failure rather than zero', () => {
    expect(stageFor('failed').number).toBe(STAGES.length);
  });
});
