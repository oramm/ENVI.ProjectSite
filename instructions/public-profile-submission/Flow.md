LEGENDA OKIEN
W1 PersonProfilePage (wewnętrzny, zalogowany)
W2 Modal "Generuj link aktualizacji profilu"
W3 Public Landing (niezalogowany, z tokenem w URL)
W4 Public "Weryfikacja e-mail"
W5 Public "Edycja danych profilu" (Experience/Education/Skills)
W6 Public "Import CV" (analyze + preview + selekcja)
W7 Public "Podsumowanie i Wyślij do recenzji"
W8 Wewnętrzna sekcja "Zgłoszenia zewnętrzne" na PersonProfilePage
W9 Wewnętrzny "Panel recenzji per rekord"
W10 Public "Poprawki po uwagach" - OUT OF SCOPE (V1)

W1 PersonProfilePage (biuro)
-> W2 "Generuj link"
-> [System] link publiczny 30 dni
-> [Osoba zewn.] W3 Landing
-> W4 Weryfikacja e-mail
-> W5 Edycja danych (manualnie)
-> opcjonalnie W6 Import CV (REUSE istniejącego okna importu)
-> W7 "Wyślij"

[System] status zgłoszenia: SUBMITTED_FOR_REVIEW

[Biuro] W8 "Zgłoszenia zewnętrzne" (na profilu osoby)
-> W9 Recenzja per rekord: - ACCEPT -> od razu gotowe do użycia - BRAK AKCEPTU -> rekord pomijany/usuwany (bez historii)

[System] do profilu trafiają tylko rekordy ACCEPT (w momencie decyzji ACCEPT)
[System] zgłoszenie zamyka się automatycznie po rozstrzygnieciu wszystkich rekordow
