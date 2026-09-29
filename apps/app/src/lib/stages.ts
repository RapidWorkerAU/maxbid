// What each analysis status means, in words a user reads.
//
// ux-standards.md asks for stage names rather than a bare bar, and the writing
// rules want plain sentences that say what is happening.

export type AnalysisStatus =
  | 'queued'
  | 'extracting'
  | 'triaging'
  | 'triaged'
  | 'deep_running'
  | 'complete'
  | 'failed';

export type Stage = {
  number: number;
  label: string;
  detail: string;
  /** True when nothing more will happen without the user doing something. */
  settled: boolean;
};

export const STAGES: AnalysisStatus[] = [
  'queued',
  'extracting',
  'triaging',
  'triaged',
  'deep_running',
  'complete',
];

const DESCRIPTIONS: Record<AnalysisStatus, Omit<Stage, 'number'>> = {
  queued: {
    label: 'Waiting to start',
    detail: 'Your analysis is in the queue and will start in a moment.',
    settled: false,
  },
  extracting: {
    label: 'Reading the catalogue',
    detail: 'We are fetching the catalogue and reading every lot on it.',
    settled: false,
  },
  triaging: {
    label: 'Ranking the lots',
    detail: 'We are working out a rough value for each lot so we can rank them.',
    settled: false,
  },
  triaged: {
    label: 'Ready for you',
    detail: 'Every lot is ranked. Choose the ones worth a detailed analysis.',
    settled: true,
  },
  deep_running: {
    label: 'Analysing the lots you chose',
    detail: 'We are identifying each item, finding comparable sales and working out your bid limits.',
    settled: false,
  },
  complete: {
    label: 'Finished',
    detail: 'Every lot you chose has been analysed.',
    settled: true,
  },
  failed: {
    label: 'We could not finish this analysis',
    detail:
      'Something went wrong while reading the catalogue. Nothing was charged. You can try again, or upload the catalogue as a PDF.',
    settled: true,
  },
};

export function stageFor(status: AnalysisStatus): Stage {
  const description = DESCRIPTIONS[status] ?? DESCRIPTIONS.queued;
  const index = STAGES.indexOf(status);
  return {
    ...description,
    // A failed analysis has no place in the sequence, so it reports the last
    // stage it reached rather than zero.
    number: index === -1 ? STAGES.length : index + 1,
  };
}
