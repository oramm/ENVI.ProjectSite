# Dokumentacja Widoku: Projekty i Zadania (TasksGlobal)

Ten dokument opisuje działanie i strukturę widoku `TasksGlobal`, realizującego wzorzec Master-Detail do zarządzania zadaniami w kontekście projektów.

## Ogólna Koncepcja

Widok podzielony jest na dwie główne kolumny:

1.  **Lewa kolumna (Master):** Wyszukiwarka i lista projektów.
2.  **Prawa kolumna (Detail):** Hierarchiczne drzewo zadań dla wybranego projektu.

---

## 1. Lewy Panel: Selektor Projektów

Służy do znalezienia i wybrania kontekstu pracy.

-   **Komponent:** `FilterableTable<ProjectData>` (w trybie uproszczonym, bez nagłówka tabeli).
-   **Filtrowanie:**
    -   Użytkownik może wpisać tekst (szukana fraza).
    -   Może filtrować po statusie (np. Aktywne / Zakończone) - realizowane przez `ProjectsFilterBody`.
-   **Interakcja:** Kliknięcie w wiersz projektu (`onRowClick`) ustawia go jako `selectedProject`.
-   **Efekt:** Powoduje przeładowanie prawej części ekranu (pojawia się spinner ładowania, a następnie drzewo).
-   **CRUD:** Umożliwia dodawanie nowych projektów (`ProjectAddNewModalButton`) oraz ich edycję (`ProjectEditModalButton`).

## 2. Prawy Panel: Drzewo Danych (Tasks Tree)

To serce tego widoku. Wyświetla strukturę zadań w formie zagnieżdżonych sekcji (akordeonów).

### Stany widoku

-   **Brak wyboru:** Wyświetla komunikat `NoProjectSelectedMessage` ("Wybierz projekt...").
-   **Ładowanie:** Wyświetla `LoadingMessage` ze spinnerem i nazwą wybranego projektu.
-   **Dane załadowane:** Wyświetla `FilterableTable<Task>` skonfigurowane w trybie sekcji (`initialSections`).

### Hierarchia Drzewa

Budowana w funkcji `buildTree`:

1.  **Poziom 1: Kontrakt (Contract)**
    -   To główna sekcja (Accordion).
    -   Nagłówek zawiera: Numer umowy, Alias, Status, Daty, Koordynatora.
    -   Można go edytować (`ContractEditModalButton`).
2.  **Poziom 2: Kamień Milowy (Milestone)**
    -   Zagnieżdżony w Kontrakcie.
    -   Nagłówek zawiera: Numer folderu, Nazwę typu, Daty realizacji.
    -   Można dodać nowy Kamień (`MilestoneAddNewModalButton`).
3.  **Poziom 3: Sprawa (Case)**
    -   Zagnieżdżona w Kamieniu Milowym.
    -   Nagłówek zawiera: Numer sprawy, Typ sprawy.
    -   Można dodać nową Sprawę (`CaseAddNewModalButton`).
4.  **Poziom 4 (Liście): Zadania (Tasks)**
    -   To są właściwe wiersze tabeli wyświetlane wewnątrz Sprawy.
    -   Kolumny: Nazwa/Opis, Termin, Status (Badge), Właściciel.
    -   Zadania można dodawać (`TaskAddNewModalButton`) i edytować (`TaskEditModalButton`).

---

## 3. Filtrowanie w Prawym Panelu

### Komponent Filtra: `TasksGlobalFilterBody`

Panel ten umożliwia zawężanie widocznych danych w drzewie. Dostępne kryteria:

-   **Kontrakt:** Wybór konkretnej umowy z listy (przefiltrowanej do bieżącego projektu).
-   **Właściciel:** Wybór osoby odpowiedzialnej (z listy pracowników ENVI).
-   **Statusy Kontraktu:** Możliwość wyboru wielu statusów (np. tylko Aktywne).

### Zasady Wyświetlania Filtra

Filtr w komponencie `FilterableTable` (używanym w prawym panelu) posiada specyficzną logikę widoczności (`showFilter`), zależną od trybu wyświetlania danych:

1.  **Tryb Sekcji (Drzewo):**
    -   Filtr jest **ukryty**, jeśli liczba głównych sekcji (Kontraktów) jest mniejsza niż 5.
    -   Filtr pojawia się automatycznie, gdy liczba kontraktów wynosi 5 lub więcej.
    -   Ma to na celu niezaśmiecanie widoku przy małej ilości danych, gdzie użytkownik może łatwo wzrokowo znaleźć interesujący go element.
2.  **Tryb Płaski (Lista):**
    -   Filtr jest zawsze widoczny (o ile zdefiniowano `FilterBodyComponent`).

---

## 4. Zasady Techniczne i Komponenty

-   **FilterableTable:** Oba panele korzystają z tego samego, uniwersalnego komponentu tabeli. Prawy panel wykorzystuje jego zaawansowaną funkcję `SectionNode`, która pozwala grupować dane wierszy w wirtualne foldery (sekcje).
-   **Repozytoria:**
    -   Lewy panel korzysta z `projectsRepository`.
    -   Prawy panel pobiera dane zbiorcze przez `contractsWithChildrenRepository` (jeden strzał do API pobiera całą strukturę: Kontrakty -> Kamienie -> Sprawy -> Zadania), a następnie "rozpakowuje" je do struktury drzewa w pamięci przeglądarki.
-   **Modalne przyciski (CRUD):** Każdy poziom drzewa ma wstrzyknięte odpowiednie komponenty przycisków (np. `AddNewButtonComponent`), co pozwala na edycję struktury bezpośrednio z poziomu drzewa, bez przechodzenia do innych widoków.

### Uwagi dla Designera

Projektując zmiany w tym widoku, należy pamiętać, że:

1.  **Prawa strona jest zależna od lewej.**
2.  **Struktura jest sztywna hierarchicznie:** Projekt -> Kontrakt -> Kamień -> Sprawa -> Zadanie.
3.  **Interfejs jest "gęsty":** Mamy dużo zagnieżdżeń, więc kluczowe jest czytelne oddzielenie poziomów (wciecia, kolory tła nagłówków sekcji), aby użytkownik nie zgubił się w strukturze.
