# Experience Update - Session Plan (Server + Client)

Data startu: 2026-02-20
Status dokumentu: ACTIVE
Zakres: Backend (`PS-nodeJS`) + Frontend (`ENVI.ProjectSite`)

## Cel

Dowiezc uproszczony proces `Aktualizacja doswiadczenia`:

- jeden aktywny proces i jeden aktywny link per osoba,
- hard cut API na `experience-updates`,
- workflow `uzupelnij braki` po review.

## Zasady zamrozone

1. Hard cut bez aliasow `public-profile-submissions`.
2. Brak listy historycznych draftow na UI operacyjnym.
3. Zawsze pokazujemy ostatni wazny link (do `expiresAt`) i metadane ostatniej wysylki.
4. `REJECT` wymaga komentarza, kandydat widzi feedback i poprawia tylko odrzucone/brakujace elementy.
5. Start implementacji blokowany przez `Doc-first Gate`.

## Fazy

### F0 - Doc-first Gate (MUST)

- Plan/progress/activity + checklist po obu repo zsynchronizowane data i zakresem.
- `Flow.md` i `api-contract.md` odzwierciedlaja finalny kontrakt endpointow.

Warunek przejscia:

- server i client dokumenty sa spójne (`2026-02-20`).

### F1 - Backend hard cut

- Prefix staff: `/v2/persons/:personId/experience-updates/*`.
- Prefix public: `/v2/public/experience-update/*`.
- DTO staff zwraca `copyLink` + `lastDispatch`.
- `REJECT` wymaga komentarza.

### F2 - Frontend hard cut

- UI nazewnictwo: `Aktualizacja doswiadczenia`.
- Jeden aktywny stan procesu, bez `DRAFT #N`.
- Widoczne stale: `copyLink`, `expiresAt`, recipient, eventAt, status.
- Formularz review z komentarzem wymaganym dla `REJECT`.

## Definition of Done

- F0 DONE: docs synchronized.
- F1 DONE: backend endpointy i DTO po hard cut, migracje i testy przechodza.
- F2 DONE: FE dziala end-to-end na nowych endpointach i pokazuje feedback do uzupelnien.