'use client';

import { Button } from '@maxbid/ui/primitives/Button';
import { InfoNote } from '@maxbid/ui/primitives/InfoNote';
import { Input } from '@maxbid/ui/primitives/Input';
import { MonoLabel } from '@maxbid/ui/primitives/MonoLabel';
import { ToggleGroup } from '@maxbid/ui/primitives/ToggleGroup';
import { useActionState, useState } from 'react';
import type { ActionResult } from '../../lib/actions';

/**
 * SC16. What MaxBid has to know before it can work out a bid.
 *
 * Nothing here has a default, per decision record 0022. A default profit
 * target is a guess about somebody else's business, and every cost only ever
 * reduces a bid figure, so an invented one produces a maximum bid that is too
 * high. This screen exists because we would rather ask.
 *
 * Every term is explained where it first appears, per the writing rules, since
 * this is the first screen a new user reads.
 */
export type SetupFormProps = {
  organisationName: string;
  action: (previous: ActionResult | null, form: FormData) => Promise<ActionResult>;
};

function GstQuestion({
  organisationName,
  value,
  onChange,
}: {
  organisationName: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="font-sans font-semibold text-ink">
        Is {organisationName} registered for GST?
      </legend>
      <p className="mt-1 text-sm text-ink-muted">
        A business registered for goods and services tax claims the GST back on
        what it buys, so the GST is not a cost to it. A business that is not
        registered pays the GST and keeps it as a cost. This changes the most
        you should bid, often by thousands.
      </p>
      <input type="hidden" name="gstRegistered" value={value} />
      <ToggleGroup
        className="mt-3"
        legend="Registered for GST"
        value={value}
        onChange={onChange}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]}
      />
    </fieldset>
  );
}

function ProfitQuestion({ mode, onMode }: { mode: string; onMode: (value: string) => void }) {
  const inDollars = mode === 'dollars';
  return (
    <fieldset className="mt-8">
      <legend className="font-sans font-semibold text-ink">
        How do you think about profit?
      </legend>
      <p className="mt-1 text-sm text-ink-muted">
        In dollars means a fixed amount you want to make on a lot. As a return
        on cost means a share of what the lot costs you all in, so the figure
        grows with the size of the lot.
      </p>
      <input type="hidden" name="profitMode" value={mode} />
      <ToggleGroup
        className="mt-3"
        legend="How you think about profit"
        value={mode}
        onChange={onMode}
        options={[
          { value: 'dollars', label: 'In dollars' },
          { value: 'percent', label: 'As a return on cost' },
        ]}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          id="target"
          name="target"
          type="number"
          min="0"
          step={inDollars ? '50' : '1'}
          required
          label={inDollars ? 'Profit you are aiming for' : 'Return you are aiming for'}
          hint={
            inDollars
              ? 'In dollars. This sets your target bid, the most you should pay to make it.'
              : 'As a percentage. For example 30 for a thirty percent return on cost.'
          }
        />
        <Input
          id="minimum"
          name="minimum"
          type="number"
          min="0"
          step={inDollars ? '50' : '1'}
          required
          label={inDollars ? 'Least profit you would accept' : 'Least return you would accept'}
          hint="This sets your limit bid, the most you should pay before a lot stops being worth buying."
        />
      </div>
    </fieldset>
  );
}

export function SetupForm({ organisationName, action }: SetupFormProps) {
  const [state, submit, pending] = useActionState(action, null);
  const [gstRegistered, setGstRegistered] = useState('no');
  const [profitMode, setProfitMode] = useState('dollars');

  return (
    <form action={submit} className="max-w-xl">
      <MonoLabel>Setting up</MonoLabel>
      <h1 className="mt-1 font-sans text-2xl font-bold text-ink">
        Two things before your first analysis
      </h1>
      <p className="mt-2 text-ink-muted">
        MaxBid works out the most you should pay for a lot. To do that it needs
        to know how you are taxed and what profit you are aiming for. We do not
        guess at either, because both change every figure we show you.
      </p>

      <GstQuestion
        organisationName={organisationName}
        value={gstRegistered}
        onChange={setGstRegistered}
      />

      <ProfitQuestion mode={profitMode} onMode={setProfitMode} />

      <InfoNote className="mt-6">
        Transport, repairs and other costs are left unset for now. Until you add
        them, every bid figure is an upper bound, because a cost we do not know
        about only ever makes the most you should bid smaller.
      </InfoNote>

      {state && 'error' in state ? (
        <p role="alert" className="mt-4 font-sans text-sm text-zone-red">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="mt-6" disabled={pending}>
        {pending ? 'Saving' : 'Save and start'}
      </Button>
    </form>
  );
}
