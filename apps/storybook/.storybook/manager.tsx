// Adds a component status filter to the toolbar, which filters the sidebar.
//
// Storybook 10.6 has no built in tag filter, and its public addon types do not
// include a sidebar mount point, so the control sits in the canvas toolbar and
// drives the sidebar through the public experimental_setFilters API.

import React, { useEffect, useState } from 'react';
import { addons, types, type API } from 'storybook/manager-api';

const ADDON_ID = 'maxbid/status-filter';
const FILTER_ID = 'maxbid-status';

const OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'changes-requested', label: 'Changes requested' },
];

const STATUS_TAGS = OPTIONS.map((option) => option.value).filter(Boolean);

function StatusFilter({ api }: { api: API }) {
  const [status, setStatus] = useState('');

  useEffect(() => {
    void api.experimental_setFilters({
      [FILTER_ID]: (item) => {
        if (!status) return true;
        const tags: string[] = item.tags ?? [];
        // Anything without a status tag, such as the register overview, stays.
        if (!STATUS_TAGS.some((tag) => tags.includes(tag))) return true;
        return tags.includes(status);
      },
    });
  }, [api, status]);

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      Status
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        style={{ fontSize: 12, padding: '2px 4px' }}
      >
        {OPTIONS.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

addons.register(ADDON_ID, (api) => {
  addons.add(ADDON_ID, {
    title: 'Component status',
    type: types.TOOL,
    render: () => <StatusFilter api={api} />,
  });
});
