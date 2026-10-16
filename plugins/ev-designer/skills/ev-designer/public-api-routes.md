# Public API routes

Hand-kept. Regenerate when a frontend adds a route. Samples captured from
`https://accounts-api.empowered.vote` on 2026-10-16, trimmed: arrays show 2 items, objects 8
fields, 15 lines at most. In local dev, call these as relative paths (`/api/...`); the dev server
proxies them to the live API.

Every route here answers without signing in. **This list is not complete.** Routes the frontends
also call but that are not sampled here include `/api/treasury/budgets/:id/transactions?link_key=`,
`/api/treasury/orgs/:id/financial-summary`, `/api/inform/boundary?layer=&geoid=`,
`/api/agenda-items/:id`, `/api/council-files/:id` and `/api/campaign-finance/politician/:id/council-votes`.
Before deciding data is missing, search the frontend for an existing call and try it.

`/api/meetings/upcoming` returns `[]` whenever nothing is scheduled; that is a real answer, not an
error.

## Places and lookup

### `GET /api/essentials/location-search?q=`

Find a place by name; gives geo_id + mtfcc for the browse routes. Used by: essentials.

```json
[
 {
  "geo_id": null,
  "mtfcc": "",
  "label": "Bloomington Township, IN · Township",
  "state": "IN",
  "area_type": "Township",
  "has_local_data": true
 },
 {
  "geo_id": "1805860",
  "mtfcc": "G4110",
  "label": "Bloomington, IN · City",
  "state": "IN",
  "area_type": "City",
```

### `POST /api/essentials/browse/by-area`

Officials who serve a place. Used by: essentials. Body: `{"geo_id":"1805860","mtfcc":"G4110"}`.

```json
[
 {
  "id": "048cb4ba-9b07-42e6-b45d-f4dffad2a088",
  "external_id": 206193,
  "first_name": "Kara",
  "middle_initial": "E",
  "last_name": "Krothe",
  "preferred_name": "",
  "name_suffix": "",
  "full_name": "Kara E Krothe",
  "…": "43 more fields"
 },
 {
  "id": "06464416-e8f4-4df1-af4c-2d785863721e",
  "external_id": 404401,
```

### `POST /api/essentials/browse/elections-by-area`

Upcoming elections and races for a place. Used by: essentials. Body: `{"geo_id":"1805860","mtfcc":"G4110"}`.

```json
{
 "elections": [
  {
   "election_id": "21190350-91e3-4c2c-938d-9cf8f4ac9d5c",
   "election_name": "IN 2026 Statewide General",
   "election_date": "2026-11-03",
   "election_type": "general",
   "jurisdiction_level": "state",
   "races": [
    "{…}",
    "{…}",
    "…18 more"
   ]
  }
 ]
```

### `GET /api/essentials/elections-by-address?address=`

Elections on the ballot at a street address. Used by: essentials.

```json
{
 "elections": [
  {
   "election_id": "21190350-91e3-4c2c-938d-9cf8f4ac9d5c",
   "election_name": "IN 2026 Statewide General",
   "election_date": "2026-11-03",
   "election_type": "general",
   "jurisdiction_level": "state",
   "races": [
    "{…}",
    "{…}",
    "…17 more"
   ]
  }
 ]
```

### `GET /api/essentials/browse/federal/officials`

All federal officials (large: ~1.3 MB). Used by: essentials.

```json
[
 {
  "id": "00abc782-e86b-40f2-be0d-f07fad802688",
  "external_id": -400086,
  "first_name": "Ron",
  "middle_initial": "",
  "last_name": "Johnson",
  "preferred_name": "",
  "name_suffix": "",
  "full_name": "Ron Johnson",
  "…": "43 more fields"
 },
 {
  "id": "00b75ed0-3355-4bc5-a426-1667c12e2486",
  "external_id": -27002,
```

### `GET /api/essentials/voter-info?address=`

Polling place and voter info for an address. Used by: essentials.

```json
{
 "electionName": null,
 "electionDate": null,
 "dropOffLocations": [],
 "earlyVoteSites": [],
 "pollingLocations": [],
 "ballotInfoUrl": null,
 "electionInfoUrl": null,
 "votingLocationFinderUrl": null,
 "…": "1 more fields"
}
```

## Politicians

### `GET /api/essentials/politicians/:id`

One politician profile. Used by: essentials.

```json
{
 "id": "102b239c-0a3d-44b9-ae32-88d8179197e2",
 "external_id": 354419,
 "first_name": "Todd",
 "middle_initial": "",
 "last_name": "Young",
 "preferred_name": "",
 "name_suffix": "",
 "full_name": "Todd Young",
 "…": "54 more fields"
}
```

### `GET /api/essentials/politicians/:id/elections`

Races a politician has run in. Used by: essentials.

```json
[
 {
  "election_name": "Indiana General Election",
  "election_date": null,
  "position_name": "U.S. Senate - Indiana",
  "result": "WON",
  "withdrawn": false,
  "party_name": "Republican",
  "is_primary": false,
  "is_runoff": false,
  "…": "2 more fields"
 },
 {
  "election_name": "Indiana Primary Election",
  "election_date": null,
```

### `GET /api/essentials/politicians/:id/committees`

Committee seats. Used by: essentials.

```json
[
 {
  "id": "a5fb9fbd-1701-47fe-937f-6353a5d2508f",
  "committee_id": "2f760cc0-36dc-4766-9752-ec921a5fcb03",
  "committee_name": "Consumer Protection, Technology, and Data Privacy",
  "committee_type": "subcommittee",
  "chamber": "senate",
  "jurisdiction": "federal",
  "role": "member",
  "is_current": true,
  "…": "2 more fields"
 },
 {
  "id": "47c7ab83-f5b1-4cd6-be96-6219add81cd6",
  "committee_id": "ed1693b9-d2b2-4efd-aea6-bff97decb841",
```

### `GET /api/people`

People index used by On the Record. Used by: otr.

```json
[
 {
  "politicianId": "7ac75846-3990-45d0-b74a-b85d6d672f61",
  "name": "Aaron Freeman",
  "headshotUrl": "https://kxsdzaojfaibhuzmclfq.storage.supabase.co/storage/v1/object/public/pol...",
  "party": null,
  "officeTitle": "Senator",
  "district": "State Senate District 32",
  "jurisdiction": "State of Indiana",
  "meetingCount": 1,
  "…": "2 more fields"
 },
 {
  "politicianId": "ec0cfeae-a512-4ce2-a8f2-a25b00112b9b",
  "name": "Abdul El-Sayed",
```

### `GET /api/people/:id`

One person, On the Record view. Used by: otr.

```json
{
 "politicianId": "91f6d45d-5e7e-48f6-aab1-9476d81946b5",
 "name": "Isabel Piedmont-Smith",
 "headshotUrl": "https://kxsdzaojfaibhuzmclfq.supabase.co/storage/v1/object/public/politician_...",
 "party": "Democratic",
 "officeTitle": "City Common Council - District 1",
 "district": "District 1",
 "jurisdiction": "City of Bloomington, Indiana, US",
 "meetingCount": 7,
 "…": "3 more fields"
}
```

### `GET /api/people/:id/appearances`

Meetings where a person spoke. Used by: otr.

```json
{
 "id": "91f6d45d-5e7e-48f6-aab1-9476d81946b5",
 "appearances": [
  {
   "meetingId": "a87f52de-f51d-4627-9cfd-1ce794092f29",
   "title": null,
   "eventKind": "council",
   "eventOrgs": [],
   "sourceTitle": null,
   "city": "Bloomington",
   "meetingType": "Regular Session",
   "date": "2026-07-29",
   "…": "2 more fields"
  },
  {
```

## Compass

### `GET /api/compass/topics`

Compass topics with their five stances. Used by: essentials, compass.

```json
[
 {
  "id": "af2fdfd6-02c4-49df-b09c-cf8536f4773f",
  "topic_key": "abortion",
  "title": "Reproductive Rights and Abortion Access",
  "short_title": "Abortion",
  "question_text": "How should the law handle abortion?",
  "version": 1,
  "effective_revision_id": "085feb9c-f157-4dae-bfd0-7b2736c5d87c",
  "guidance": "Where the decision sits: with the person, with doctors working inside limits,...",
  "…": "12 more fields"
 },
 {
  "id": "683c8084-2281-4920-a07c-18439b2dd413",
  "topic_key": "tariffs",
```

### `GET /api/compass/categories`

Topic categories. Used by: compass.

```json
[
 {
  "id": "eff63c93-dab4-498b-9868-28742caa0132",
  "title": "Civil Rights and Social Policy",
  "topics": [
   "{…}",
   "{…}",
   "…9 more"
  ]
 },
 {
  "id": "e167477a-d3b6-43ea-8348-d451946bfdda",
  "title": "Economic Policy and Labor",
  "topics": [
   "{…}",
```

### `GET /api/compass/lenses`

Topic lenses (preset topic groups). Used by: essentials, compass.

```json
[
 {
  "key": "federal",
  "name": "Federal Lens",
  "description": "8 issues most U.S. House & Senate members and candidates have answered",
  "color": "#1E3A5F",
  "icon": "capitol",
  "sortOrder": 10,
  "autoDistrictTypes": [
   "NATIONAL_EXEC",
   "NATIONAL_UPPER",
   "…1 more"
  ],
  "topicIds": [
   "f1e44d66-5d27-4b51-b54f-b7ace86f6a3c",
```

### `GET /api/compass/politicians/:id/answers`

A politician's compass positions. Used by: essentials, compass.

```json
[
 {
  "topic_id": "00b95a6a-75db-4521-b523-3326bba938de",
  "value": 5
 },
 {
  "topic_id": "0bc588c6-39e1-4084-b5de-cac909b8b762",
  "value": 4
 },
 "…22 more"
]
```

## Campaign finance

### `GET /api/campaign-finance/politician/:id/summary`

Money raised and spent. Used by: essentials.

```json
{
 "politician_id": "102b239c-0a3d-44b9-ae32-88d8179197e2",
 "cycle": "2026",
 "total_raised": 4401018.38,
 "total_refunded": 0,
 "refund_count": 0,
 "contribution_count": 1476,
 "confidence_level": "HIGH",
 "data_source": "fec",
 "…": "9 more fields"
}
```

### `GET /api/campaign-finance/donors/search?q=`

Search donors by name. Used by: essentials.

```json
{
 "query": "smith",
 "politicians": [
  {
   "politician_id": "9d9ce75d-b1ba-4051-a87e-e84c1619be8a",
   "politician_name": "Robin L. Kelly",
   "office_title": "U.S. Representative",
   "jurisdiction": "United States Federal Government",
   "district": "Congressional District 2",
   "total_donated": 11200,
   "contribution_count": 10,
   "mode_confidence": "HIGH",
   "…": "1 more fields"
  },
  {
```

### `GET /api/campaign-finance/politician/:id/contributions?cycle=&limit=`

Itemized contributions, paged. Used by: essentials.

```json
{
 "results": [
  {
   "id": "b80d2d0c-f29c-4695-9b6e-e6d4180bb19f",
   "donor_name": "mass mutual",
   "donor_type": "committee",
   "employer": "",
   "occupation": "",
   "sector": "Other/Unclassified",
   "amount": 11403.79,
   "contribution_date": "2024-12-31",
   "…": "2 more fields"
  },
  {
   "id": "58ec0d2f-5162-461e-956a-ac3053b29607",
```

## Read & Rank

### `GET /api/readrank/races`

Playable races. Used by: read-rank.

```json
{
 "races": [
  {
   "raceId": "ede5be4a-9692-436b-9252-1ee288f21ced",
   "office": "US Representative",
   "seat": "District 2",
   "electionName": "MO 2026 Congressional Redistricting - Polygon Pending",
   "electionDate": "2026-03-24",
   "state": "MO",
   "jurisdictionLevel": "state",
   "candidateCount": 2,
   "…": "11 more fields"
  },
  {
   "raceId": "4cc7f568-8c4f-4f6c-b43b-85e7e90f168e",
```

### `GET /api/readrank/races/:raceId/quotes`

Blind quotes for one race. Used by: read-rank.

```json
{
 "raceId": "ede5be4a-9692-436b-9252-1ee288f21ced",
 "positionName": "U.S. Representative District 2",
 "topics": [
  {
   "key": "598757c4-981e-4903-9c85-e26d506f3d2b",
   "topicKey": "abortion",
   "questionId": "598757c4-981e-4903-9c85-e26d506f3d2b",
   "title": "Abortion",
   "question": "What legal framework should govern abortion access?",
   "quotes": [
    "{…}"
   ]
  },
  {
```

### `GET /api/readrank/localities?q=`

Place search for Read & Rank. Used by: read-rank.

```json
{
 "localities": [
  {
   "name": "Bloomington",
   "state": "IL",
   "placeGeoid": "1706613",
   "countyGeoid": "17113"
  },
  {
   "name": "Bloomington",
   "state": "IN",
   "placeGeoid": "1805860",
   "countyGeoid": "18105"
  },
  "…2 more"
```

## Treasury

### `GET /api/treasury/search?q=`

Search budget categories. Used by: treasury.

```json
[
 {
  "categoryId": "5a53cd35-b3d8-4ea6-9eef-515785bf17c1",
  "budgetId": "f9a32540-e0d0-4c7e-b5fb-d3344f2d4cb3",
  "categoryName": "Administration of Justice",
  "plainName": "Justice & law enforcement",
  "shortDescription": "Federal law enforcement, courts, prisons, and justice grants.",
  "amount": 83793000000,
  "percentage": 1.1644657629583348,
  "datasetType": "operating",
  "…": "6 more fields"
 },
 {
  "categoryId": "1924a58b-83ce-4239-b4b8-1cf475eba1ec",
  "budgetId": "10a2cb09-a43f-452d-abf1-57c245b1d57e",
```

### `GET /api/treasury/cities`

Cities with budgets (very large: ~80 MB, avoid on page load). Used by: essentials, treasury.

```json
[
 {
  "id": "e426dbdc-7d08-4f20-93a2-8f5eb53a20b7",
  "name": "Abbeville County",
  "state": "SC",
  "entity_type": "county",
  "population": 24607,
  "population_year": null,
  "county_id": null,
  "hero_image_url": null,
  "…": "3 more fields"
 },
 {
  "id": "fffe10ec-061c-4953-9570-1c5de9c4eb86",
  "name": "Abbott Township, Potter County",
```

### `GET /api/treasury/cities/:id`

One city or county. Used by: treasury.

```json
{
 "id": "592cc4ec-23ad-4f5f-be93-8be4dd9bc557",
 "name": "Bloomington",
 "state": "IN",
 "entity_type": "city",
 "population": 79986,
 "population_year": null,
 "county_id": "0361fe24-9c04-4677-9c65-2281cadb7647",
 "hero_image_url": null,
 "…": "3 more fields"
}
```

### `GET /api/treasury/cities/:id/budgets`

A city's budgets by year and type. Used by: treasury.

```json
[
 {
  "id": "c31b4c46-36d4-4ff1-9287-c0505d4028d9",
  "municipality_id": "592cc4ec-23ad-4f5f-be93-8be4dd9bc557",
  "fiscal_year": 2026,
  "dataset_type": "operating",
  "period_label": null,
  "total_budget": 224674053.42999983,
  "fund_scope": "unknown",
  "basis": "unknown",
  "…": "10 more fields"
 },
 {
  "id": "32ba278c-bfcd-4dda-8150-dc87c33a44e6",
  "municipality_id": "592cc4ec-23ad-4f5f-be93-8be4dd9bc557",
```

### `GET /api/treasury/budgets/:id/categories`

Spending or revenue categories in a budget. Used by: treasury.

```json
[
 {
  "name": "Utilities",
  "amount": 57178518.929999985,
  "actualAmount": 10423259.200000003,
  "percentage": 25.449542596076725,
  "color": "#4476ca",
  "items": 0,
  "enrichment": {
   "plainName": "Water and Electric Services",
   "shortDescription": "This fund pays for the city's water, sewer, and electric utility operations a...",
   "description": "This fund covers the city's utility services including water treatment and di...",
   "tags": [
    "utilities",
    "water",
```

### `GET /api/treasury/federal/context`

Federal budget context (large: ~10 MB). Used by: treasury.

```json
{
 "annual_summary": [
  {
   "fiscal_year": 1962,
   "receipts": 99676000000,
   "outlays": 106821000000,
   "surplus_or_deficit": -7146000000,
   "mandatory": 27900000000,
   "discretionary_defense": 52600000000,
   "discretionary_nondefense": 19500000000,
   "net_interest": 6900000000,
   "…": "3 more fields"
  },
  {
   "fiscal_year": 1963,
```

## On the Record

### `GET /api/meetings`

Published meetings and clips. Used by: otr.

```json
[
 {
  "id": "38e71313-bdc5-4104-8e9c-9e5d73d23f08",
  "title": "BECERRA vs. HILTON on Gas Prices (CBS LA) - CA Governor Candidates In Depth",
  "eventKind": "news_clip",
  "city": null,
  "state": null,
  "date": "2026-10-01",
  "meetingType": "Interview",
  "durationSeconds": 492.864,
  "…": "19 more fields"
 },
 {
  "id": "5a98c7c9-d215-4c80-b403-844ad39fc5c7",
  "title": "California Governor Debate - CNN (General Election)",
```

### `GET /api/meetings/:id`

One meeting with transcript. Used by: otr.

```json
{
 "id": "38e71313-bdc5-4104-8e9c-9e5d73d23f08",
 "title": "BECERRA vs. HILTON on Gas Prices (CBS LA) - CA Governor Candidates In Depth",
 "eventKind": "news_clip",
 "city": null,
 "state": null,
 "date": "2026-10-01",
 "meetingType": "Interview",
 "durationSeconds": 492.864,
 "…": "21 more fields"
}
```

### `GET /api/topics`

On the Record topics. Used by: read-rank, otr.

```json
{
 "topics": [
  {
   "topicKey": "taxes",
   "title": "Taxes",
   "itemCount": 86,
   "meetingCount": 52
  },
  {
   "topicKey": "housing",
   "title": "Housing",
   "itemCount": 83,
   "meetingCount": 42
  },
  "…39 more"
```

### `GET /api/search?q=`

Full-text search across meetings. Used by: essentials, otr.

```json
{
 "query": "budget",
 "page": 1,
 "totalCount": 367,
 "results": [
  {
   "meetingId": "4d53e045-cf54-4679-896a-9b162d22f6db",
   "title": "Xavier Becerra - The Race for Governor - Commonwealth Club World Affairs of C...",
   "eventKind": "forum",
   "eventOrgs": [],
   "sourceTitle": "The Race for Governor 2026: Xavier Becerra",
   "city": null,
   "meetingType": "Candidate Forum",
   "date": "2026-02-10",
   "…": "6 more fields"
```

### `GET /api/meetings/upcoming`

Meetings scheduled but not yet held. Used by: otr.

```json
[]
```

### `GET /api/meetings/:id/transcript`

Speaker-labelled transcript. Used by: otr.

```json
{
 "segments": [
  {
   "id": "f876f120-51c4-413d-9d63-2c4a5f158911",
   "meetingId": "a87f52de-f51d-4627-9cfd-1ce794092f29",
   "speakerId": "4182bbd1-d198-404a-8c5f-e0d9d047c716",
   "segmentIndex": 0,
   "startTime": 0.031,
   "endTime": 16.433,
   "text": "- Seeing that it is now 630, I would like to call to order this regular sessi...",
   "speakerLabel": "SPEAKER_12",
   "…": "3 more fields"
  },
  {
   "id": "7aad31f9-ed2a-43bb-afbb-2d57a1addf94",
```

### `GET /api/meetings/:id/votes`

Votes taken in a meeting. Used by: otr.

```json
[
 {
  "id": "a5e1ad2a-ab25-4db1-90ae-13bb0873a04e",
  "meetingId": "a87f52de-f51d-4627-9cfd-1ce794092f29",
  "resolution": "Ordinance 2026-16",
  "description": "Daily moved and Zulich seconded to present Ordinance 2026-16 for second readi...",
  "result": "Continued 8–0",
  "voteType": "roll call",
  "timestamp": null,
  "createdAt": null,
  "…": "1 more fields"
 },
 {
  "id": "b0f4f028-9a0c-4bd0-bc57-88e6250441e7",
  "meetingId": "a87f52de-f51d-4627-9cfd-1ce794092f29",
```

### `GET /api/meetings/:id/summary`

Meeting summary. Used by: otr.

```json
{
 "id": "a87f52de-f51d-4627-9cfd-1ce794092f29",
 "meetingId": "a87f52de-f51d-4627-9cfd-1ce794092f29",
 "summaryType": "meeting",
 "model": "claude-haiku-4-5-20251001+claude-sonnet-4-5",
 "createdAt": "2026-07-31T11:50:59.016557",
 "executiveSummary": "The Bloomington City Council held a routine meeting with no public comment an...",
 "keyDecisions": [],
 "sections": [
  {
   "id": "a87f52de-f51d-4627-9cfd-1ce794092f29:0",
   "summaryId": "a87f52de-f51d-4627-9cfd-1ce794092f29",
   "sectionType": "opening",
   "title": "Call to Order",
   "content": "# Summary\n\nThe City Common Council meeting in Bloomington was called to order...",
```

### `GET /api/topics/:topicKey`

One topic with its meeting items. Used by: otr.

```json
{
 "topicKey": "taxes",
 "title": "Taxes",
 "items": [
  {
   "meetingId": "38e71313-bdc5-4104-8e9c-9e5d73d23f08",
   "title": "BECERRA vs. HILTON on Gas Prices (CBS LA) - CA Governor Candidates In Depth",
   "eventKind": "news_clip",
   "eventOrgs": [
    "CBS LA"
   ],
   "sourceTitle": "BECERRA vs. HILTON on GAS PRICES | California Governor Candidates In Depth",
   "city": null,
   "meetingType": "Interview",
   "date": "2026-10-01",
```

