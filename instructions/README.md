# Instrukcje i wytyczne projektu

Kod jest zrodlem prawdy o tym, jak aplikacja dziala. Te pliki trzymaja reguly, receptury
i pulapki, ktorych z kodu nie widac.

## Zasada: Backend-First

Frontend **waliduje** dane z API i zglasza braki; naprawa idzie do backendu
(`C:\Apache24\htdocs\PS-nodeJS`). Zadnych workaroundow na froncie — utrzymujemy spojnosc
kontraktu API.

Warning `Brak wymaganego pola "_ourIdOrNumber_Name"` = dodaj computed field w kontrolerze
Node.js, nie kombinuj w Reakcie.

## Pliki

| Plik | Zawartosc |
| --- | --- |
| [AI_GUIDELINES.md](./AI_GUIDELINES.md) | reguly FE: `RepositoryReact`, FilterableTable, modale, immutability, typowe bledy |
| [selectors.md](./selectors.md) | selektory: wlasne repo per selektor, kolizje sessionStorage, walidacja, pick-or-create |
| [crud-module-guide.md](./crud-module-guide.md) | receptura nowego modulu CRUD (albo skill `/new-crud-module`) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | setup, `.env`, dev login, skrypty, Puppeteer |
| [ui-browser-loop.md](./ui-browser-loop.md) | iteracyjne dopracowanie UI ze zrzutami ekranu |

## Kontrakt API

Zrodlem prawdy dla typow, DTO i endpointow jest backend. Przed zmiana
`Typings/bussinesTypes.d.ts` przeczytaj `C:\Apache24\htdocs\PS-nodeJS\src\types\types.d.ts`
albo odpowiedni kontroler. Nie zgaduj struktury payloadu z kodu UI.

## Dokumenty robocze

Plan/progress/log dla otwartego zadania moga zyc w `instructions/<inicjatywa>/`. Po zamknieciu
zadania kasuj je — historia zostaje w gicie. Prace dotykajace DB/env/deploy prowadzi backend.

`docs/` to artefakt builda GitHub Pages, nie dokumentacja.
