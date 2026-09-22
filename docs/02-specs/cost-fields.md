# Cost Field Specification

Source: MaxBid Project Workbook, tab 09 Cost Fields.

| Field | Source | Default | Editable per lot | GST treatment |
| --- | --- | --- | --- | --- |
| Expected resale price | System (scenario), editable | Selected scenario | Yes | Entered GST inclusive. Registered users net off GST. |
| Hammer price | User or slider | Target bid | Yes | GST added when the auction terms say the lot attracts GST. |
| Buyer's premium rate | Extracted from auction terms | Platform default fallback | Yes | Usually attracts GST. Flag editable. |
| GST on hammer | Extracted | From auction terms | Yes | Creditable for registered users. |
| GST on premium | Extracted | From auction terms | Yes | Creditable for registered users. |
| Transport | Distance estimate | Rate per km and base fee by size class from cost profile | Yes | Entered GST inclusive. |
| Removal or crane | User | Cost profile | Yes | Entered GST inclusive. |
| Repairs | User | Cost profile, dollars or percentage of the selected resale scenario | Yes | Entered GST inclusive. A percentage applies to the GST inclusive resale the bid is calculated from, per decision record 0005. |
| Replacement parts | User | Zero | Yes | Entered GST inclusive. |
| Testing or certification | User | Cost profile | Yes | Entered GST inclusive. |
| Cleaning and preparation | User | Cost profile | Yes | Entered GST inclusive. |
| Storage | User | Cost profile | Yes | Entered GST inclusive. |
| Selling fees | User (manual by decision D24) | Blank with warning flag | Yes | Entered GST inclusive. |
| Other costs | User | Zero | Yes | Entered GST inclusive. |
| Profit target | User | Profile default, dollars or percentage | Yes | Not a cost. Drives target bid. |
| Minimum acceptable profit | User | Profile default | Yes | Not a cost. Drives the limit bid. |
