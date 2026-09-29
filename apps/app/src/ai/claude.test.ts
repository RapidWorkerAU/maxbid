import { describe, expect, it } from 'vitest';
import { UnrecordedSpendError } from './claude';

describe('spend that nothing recorded', () => {
  // The first live attempt at S4 ran against a database that had no ai_runs
  // table yet, because the migration had not been pushed. Every call would
  // have spent money and left no trace, and the spend ceiling is worked out
  // from those very rows, so nothing could have capped it either.
  it('says plainly why the stage stopped', () => {
    const error = new UnrecordedSpendError('relation "ai_runs" does not exist');
    expect(error.message).toMatch(/could not be recorded/);
    expect(error.message).toMatch(/spend money we cannot account for/);
  });

  it('carries what the database actually said, so it can be fixed', () => {
    const error = new UnrecordedSpendError('relation "ai_runs" does not exist');
    expect(error.message).toContain('relation "ai_runs" does not exist');
  });

  it('is its own kind of error, not a generic one', () => {
    // A caller has to be able to tell this apart from a call that simply
    // failed, because this one means stop rather than retry.
    expect(new UnrecordedSpendError('x')).toBeInstanceOf(Error);
    expect(new UnrecordedSpendError('x').name).toBe('UnrecordedSpendError');
  });
});
