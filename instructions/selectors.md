# Business Object Selectors — reguly

Selektory (`ContractSelector`, `ProjectSelector`, `PersonSelector`, `CaseSelectMenuElement`, ...)
zyja w `src/View/Modals/BussinesObjectSelectors.tsx` i opieraja sie na `MyAsyncTypeahead`.
Ten plik trzyma reguly i pulapki. Implementacje czytaj z kodu.

## 1. Kazdy selektor ma WLASNE repository

`RepositoryReact` zapisuje sie do `sessionStorage` pod kluczem `name`. Dwa komponenty z tym
samym `name` nadpisuja sobie dane nawzajem.

Klasyczny objaw: lista miala 100 kontraktow, po otwarciu modala edycji ma jeden, a po
odswiezeniu strony nadal jeden — modal uzyl repozytorium glownej listy.

```typescript
const localRepository = useMemo(
    () => new RepositoryReact<Contract>({
        actionRoutes: { getRoute: 'contracts', addNewRoute: '', editRoute: '', deleteRoute: '' },
        name: 'contractSelector_temp', // ten sam endpoint, INNY klucz sessionStorage
    }),
    [] // pusta tablica zaleznosci - instancja tworzona raz
);
```

To samo dotyczy `GeneralModal.loadDataObject()`: szczegoly pobiera tymczasowe repo
`${repository.name}_modalDetails_temp`, a wynik wchodzi do glownej listy przez
`repository.replaceItemById(id, details)`.

### Konwencja nazw

| Kontekst | Nazwa / klucz | Przyklad |
| --- | --- | --- |
| glowna lista | `{resource}` | `contracts` |
| selektor | `{resource}Selector_temp` | `contractSelector_temp` |
| modal (szczegoly) | `{resource}_modalDetails_temp` | `contracts_modalDetails_temp` |
| widok szczegolow | `{resource}Details_temp` | `contractDetails_temp` |

Zasada: wszystko, co nie jest glowna lista, dostaje lokalne repo z sufiksem `_temp`.

### Lokalne czy globalne repo?

Lokalne: modale i dialogi, podzbiory danych, komponenty pomocnicze (selector, lookup,
autocomplete), dane jednorazowe, komponent uzywany kilka razy na jednej stronie.

Globalne: glowny widok listy (`FilterableTable`), dane wspoldzielone miedzy komponentami
na tym samym poziomie, cache potrzebny miedzy roznymi czesciami UI.

### `skipCache: true`

`loadItemsFromServerPOST([params], route, { skipCache: true })` nie zapisuje do sessionStorage.
Uzywaj dla repozytoriow tymczasowych i jednorazowych wyszukiwan; nie uzywaj dla glownej listy,
ktora ma przetrwac odswiezenie. Przy unikalnej nazwie repo `skipCache` jest opcjonalny.

## 2. Walidacja danych z backendu (dwa etapy)

**Etap 1 — `ensureLabelKey` (ToolsForms), w `MyAsyncTypeahead.handleSearch`.**
Sprawdza, czy obiekt ma `labelKey` jako string. Gdy nie: loguje ostrzezenie z kontekstem,
**wysyla maila na serwer** ze zgloszeniem braku pola i podstawia `"[Brak danych]"`.
Dzieki temu `react-bootstrap-typeahead` nigdy nie dostanie obiektu bez `labelKey`.

**Etap 2 — `safeGetField` (ToolsForms), w `renderOption`.**
Probuje pol po kolei i zwraca fallback:
`safeGetField<string>(option, ['ourId', 'number'], '[Brak numeru]')`. Nie loguje.

**Backend-First:** warning `Brak wymaganego pola "_ourIdOrNumber_Name"` naprawia sie
w kontrolerze Node.js (computed field), nigdy obejsciem na froncie.

## 3. DO / DON'T

DO:

- `useMemo` z pusta tablica zaleznosci dla lokalnego repo, nazwa z sufiksem `_temp`.
- `labelKey` musi odpowiadac polu, ktore backend faktycznie zwraca.
- `safeGetField` dla pol opcjonalnych, typowanie `option as ContractData` (nie `any`).

DON'T:

- Nie przekazuj repozytorium przez props do selektora — ma tworzyc wlasne.
- Nie nazywaj lokalnego repo tak jak glownej listy.
- Nie loguj w `renderOption` (logowanie siedzi w `ensureLabelKey`).
- Nie owijaj `renderOption` w try-catch — walidacja etapu 1 to zalatwia.
- Nie uzywaj `safeGetField` dla `labelKey` — jest juz zagwarantowany.

## 4. Pick-or-create (tworzenie obiektu w panelu bocznym)

Gdy brakujacego obiektu nie da sie dodac bez opuszczenia formularza (np. Sprawa, ktorej CRUD
zyje w `TasksGlobal`), selektor dostaje przycisk `onRequestCreate`, a obok modala otwiera sie
`InlineCreateDrawer<T>` (`src/View/Modals/InlineCreateDrawer.tsx`, Offcanvas z wlasnym
`FormProvider`). Pominiety `onRequestCreate` = zachowanie bez zmian.

Reguly wiringu:

- **Ta sama instancja repository** dla panelu i selektora. Inna instancja = nowy obiekt nie
  pojawi sie na liscie opcji.
- `onCreated(created)` czyta swiezy obiekt z `repository.items` i ustawia go przez
  `setValue(..., { shouldValidate: true })` z deduplikacja. Zadnej mutacji stanu wprost.
- Odswiezenie opcji selektora przez licznik `refreshToken` w zaleznosciach `useEffect`.
- Panel dziala w `mode: 'onChange'` + `yupResolver`, zeby pola warunkowe rewalidowaly sie od razu.

Punkty rozszerzen (zagniezdzone panele, rekurencyjne tworzenie Kamienia milowego, uzycie dla
innych selektorow) sa oznaczone w kodzie markerem `TODO(graf)`.
