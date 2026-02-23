# Flow - Aktualizacja doswiadczenia

LEGENDA OKIEN

- W1 PersonProfilePage (wewnetrzny, zalogowany)
- W2 Modal `Wyslij link aktualizacji doswiadczenia`
- W3 Public Landing (token w URL)
- W4 Public `Weryfikacja e-mail`
- W5 Public `Edycja danych`
- W6 Public `Import CV` (opcjonalnie)
- W7 Public `Wyslij do recenzji`
- W8 Sekcja staff `Aktualizacja doswiadczenia`
- W9 Panel recenzji per rekord + komentarz

## Przeplyw

W1 -> W2 -> [System] generuje nowy aktywny link

- poprzedni aktywny link zostaje uniewazniony,
- w UI staff widoczny jest `copyLink` wazny do `expiresAt`.

[Osoba zewnetrzna]

- W3 Landing
- W4 Verify email
- W5 Edycja
- (opcjonalnie) W6 Import CV
- W7 Submit

[Biuro]

- W8 widzi pojedynczy stan procesu + last dispatch metadata
- W9 review:
  - `ACCEPT` -> natychmiastowy zapis
  - `REJECT` -> komentarz wymagany i zwracany kandydatowi

[System]

- Kandydat poprawia tylko odrzucone/brakujace elementy.
- Proces zamyka sie po rozstrzygnieciu wszystkich elementow.