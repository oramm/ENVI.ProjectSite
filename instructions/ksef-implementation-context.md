# Kontekst Implementacji KSeF - Krajowy System e-Faktur

## 📋 Cel dokumentu
Ten dokument zawiera pełen kontekst wdrożenia integracji z KSeF (Krajowy System e-Faktur) w aplikacji ENVI.ProjectSite. Ma służyć jako podstawa do stworzenia komunikatu informacyjnego dla użytkowników zespołu.

---

## 🎯 Czym jest KSeF?
**Krajowy System e-Faktur (KSeF)** to obowiązkowy od 1 lipca 2024 r. system elektronicznego wystawiania, przesyłania i przechowywania faktur w Polsce, prowadzony przez Ministerstwo Finansów.

Główne korzyści:
- **Automatyczna archiwizacja** faktur w systemie Ministerstwa Finansów
- **Uwierzytelnienie prawne** - UPO (Urzędowe Poświadczenie Odbioru) jako dowód wystawienia
- **Ujednolicenie procesu** fakturowania w Polsce
- **Zgodność z przepisami** obowiązującymi od lipca 2024

---

## 🏗️ Architektura Rozwiązania

### **Frontend (React/TypeScript)**

#### 1. **Lista Faktur** - [InvoicesSearch.tsx](../src/Erp/InvoicesList/InvoicesSearch.tsx)
**Lokalizacja w aplikacji:** Menu → Faktury → Lista faktur

**Nowa kolumna "KSeF"** wyświetla status integracji:
- ✅ **Zielona ikona** - Faktura przyjęta w KSeF (ma numer KSeF)
- 🟡 **Żółta ikona "W trakcie"** - Faktura wysłana, oczekuje na potwierdzenie
- ⚪ **Pusta** - Faktura nie wysłana do KSeF

**Komponent:** `KsefStatusBadge` renderuje status wizualnie na podstawie:
- `invoice.ksefNumber` - jeśli istnieje, faktura jest przyjęta
- `invoice.ksefStatus === "PENDING"` - faktura w trakcie przetwarzania

---

#### 2. **Widok Szczegółów Faktury** - [InvoiceDetails.tsx](../src/Erp/InvoicesList/InvoiceDetails/InvoiceDetails.tsx)
**Lokalizacja:** Kliknięcie na fakturę z listy → Szczegóły faktury

**Nowa sekcja "KSeF - Krajowy System e-Faktur"** na dole ekranu zawiera:

##### **A. Informacje o statusie:**
- **Status faktury:**
  - ✅ "Przyjęta" - faktura zarejestrowana w KSeF
  - 🟡 "Wysłana - oczekuje na potwierdzenie" - w trakcie przetwarzania
  - ⚪ "Nie wysłana" - faktura nie została jeszcze wysłana
  
- **Numer KSeF** - unikalny identyfikator faktury w systemie (gdy otrzymany)
- **Nr referencyjny** - tymczasowy numer sesji wysyłki (do momentu otrzymania numeru KSeF)
- **Data przyjęcia** - kiedy faktura została zaakceptowana przez KSeF

##### **B. Przyciski akcji:**

**🔵 "Wyślij do KSeF"** - Dostępny gdy:
- Faktura ma status "Wystawiona" (DONE) lub "Wysłana" (SENT)
- Faktura NIE została jeszcze wysłana do KSeF
- Brak numeru KSeF i statusu wysyłki

**Proces wysyłki:**
1. Kliknięcie przycisku "Wyślij do KSeF"
2. Wysłanie faktury do backendu → Backend łączy się z API KSeF
3. System automatycznie sprawdza status co 3 sekundy (max 10 prób = 30 sekund)
4. Po otrzymaniu potwierdzenia wyświetla numer KSeF
5. W przypadku problemów - komunikat błędu z detalami

**⚪ "Odśwież status"** - Dostępny gdy:
- Faktura została wysłana, ale jeszcze nie ma numeru KSeF
- Ręczne sprawdzenie statusu w systemie KSeF

**🟢 "📄 Pobierz UPO"** - Dostępny gdy:
- Faktura ma numer KSeF (została przyjęta)
- Pozwala pobrać **UPO (Urzędowe Poświadczenie Odbioru)** - dokument XML potwierdzający przyjęcie faktury

---

#### 3. **Implementacja KSeF** - [KsefSection.tsx](../src/Erp/InvoicesList/InvoiceDetails/KsefSection.tsx)

**Główne funkcje komponentu:**

##### **`sendToKsef()` - Wysyłka faktury**
```
POST /invoice/{id}/ksef/send
```
- Wysyła fakturę do KSeF
- Otrzymuje numer referencyjny (sessionId)
- Aktualizuje status faktury na "PENDING"
- Rozpoczyna automatyczne sprawdzanie statusu (polling co 3 sek)

##### **`startStatusPolling()` - Automatyczne sprawdzanie**
```
GET /invoice/{id}/ksef/status
```
- Sprawdza status co 3 sekundy
- Max 10 prób (30 sekund)
- Aktualizuje fakturę gdy otrzyma numer KSeF

**Obsługiwane statusy:**
- **200** - Sukces, faktura przyjęta
- **440** - Duplikat (faktura już istnieje w KSeF)
- **100** - W trakcie przetwarzania

##### **`refreshStatus()` - Ręczne odświeżenie**
```
GET /invoice/{id}/ksef/status
```
- Jednorazowe sprawdzenie statusu
- Przycisk "Odśwież status"

##### **`downloadUpo()` - Pobieranie UPO**
```
GET /invoice/{id}/ksef/upo
```
- Pobiera plik XML z poświadczeniem odbioru
- Automatycznie otwiera/zapisuje plik

---

### **Nowe pola w bazie danych (typ Invoice)**

Dodano 4 nowe pola do encji `Invoice` w [bussinesTypes.d.ts](../Typings/bussinesTypes.d.ts):

```typescript
export interface Invoice extends RepositoryDataItem {
    // ... pozostałe pola ...
    
    // Pola KSeF
    ksefNumber?: string | null;        // Numer faktury w KSeF (otrzymany po przyjęciu)
    ksefStatus?: string | null;        // Status wysyłki ("PENDING", "200", "440", itp.)
    ksefSessionId?: string | null;     // Nr referencyjny sesji wysyłki
    ksefUpo?: string | null;           // (Zarezerwowane) Ścieżka do UPO
}
```

---

## 🔌 Endpointy Backend (do implementacji/dokumentacji)

### **1. POST `/invoice/{id}/ksef/send`**
**Cel:** Wysyła fakturę do systemu KSeF

**Request:**
- Header: `Content-Type: application/json`
- Credentials: include (sesja użytkownika)

**Response (sukces):**
```json
{
    "invoiceId": 123,
    "referenceNumber": "20240119-1234-5678-ABCD",
    "status": "PENDING",
    "message": "Faktura została wysłana do KSeF. Oczekiwanie na potwierdzenie..."
}
```

**Response (błąd walidacji - 400):**
```json
{
    "error": "Błąd walidacji",
    "details": [
        "Brak numeru NIP nabywcy",
        "Nieprawidłowa data wystawienia"
    ]
}
```

**Proces backendu:**
1. Walidacja danych faktury (NIP, daty, pozycje)
2. Wygenerowanie pliku FA_VAT (format XML zgodny z KSeF)
3. Wysłanie do API KSeF
4. Zapisanie sessionId w bazie danych
5. Zwrócenie numeru referencyjnego

---

### **2. GET `/invoice/{id}/ksef/status`**
**Cel:** Sprawdza status faktury w systemie KSeF

**Request:**
- Method: GET
- Credentials: include

**Response (faktura przyjęta - 200):**
```json
{
    "invoiceId": 123,
    "referenceNumber": "20240119-1234-5678-ABCD",
    "ksefNumber": "1234567890123456789012345678901234567890",
    "status": {
        "code": 200,
        "description": "Faktura przyjęta"
    },
    "acquisitionDate": "2024-01-19T10:30:00Z",
    "invoicingDate": "2024-01-19T10:00:00Z"
}
```

**Response (w trakcie - 100):**
```json
{
    "invoiceId": 123,
    "referenceNumber": "20240119-1234-5678-ABCD",
    "status": {
        "code": 100,
        "description": "W trakcie przetwarzania"
    }
}
```

**Response (duplikat - 440):**
```json
{
    "invoiceId": 123,
    "status": {
        "code": 440,
        "description": "Faktura już istnieje w systemie",
        "extensions": {
            "originalKsefNumber": "0987654321098765432109876543210987654321"
        }
    }
}
```

**Proces backendu:**
1. Pobranie sessionId z bazy danych
2. Zapytanie do API KSeF o status sesji
3. Jeśli otrzymano numer KSeF - aktualizacja w bazie
4. Zwrócenie aktualnego statusu

---

### **3. GET `/invoice/{id}/ksef/upo`**
**Cel:** Pobiera UPO (Urzędowe Poświadczenie Odbioru) dla faktury

**Request:**
- Method: GET
- Credentials: include

**Response (sukces):**
- Content-Type: `application/xml` lub `text/xml`
- Body: Plik XML z UPO
- Filename: `UPO_faktura_{id}.xml`

**Response (błąd - 404):**
```json
{
    "error": "Faktura nie ma numeru KSeF",
    "message": "UPO jest dostępne tylko dla faktur przyjętych w KSeF"
}
```

**Proces backendu:**
1. Sprawdzenie czy faktura ma ksefNumber
2. Pobranie UPO z API KSeF
3. Zwrócenie pliku XML

---

## 🎨 Komponenty Wizualne

### **KsefStatusBadge** - [CommonComponents.tsx](../src/View/Resultsets/CommonComponents.tsx)
Wyświetla status KSeF w formie badge'a:

```tsx
export function KsefStatusBadge({
    ksefNumber,
    ksefStatus,
}: {
    ksefNumber?: string | null;
    ksefStatus?: string | null;
}) {
    if (ksefNumber) {
        // Zielony badge z tooltipem pokazującym numer
        return <Badge bg="success">✅ Przyjęta</Badge>;
    }
    
    if (ksefStatus === "PENDING") {
        // Żółty badge dla statusu oczekującego
        return <Badge bg="warning">🟡 W trakcie</Badge>;
    }
    
    return null; // Brak badge'a dla niewysłanych faktur
}
```

---

## 📝 Scenariusze Użycia

### **Scenariusz 1: Wysłanie nowej faktury do KSeF**
1. Użytkownik wchodzi w szczegóły faktury o statusie "Wystawiona"
2. Widzi sekcję KSeF ze statusem "⚪ Nie wysłana"
3. Klika przycisk "Wyślij do KSeF"
4. System pokazuje komunikat "Wysyłanie do KSeF..."
5. Po chwili automatycznie sprawdza status
6. W ciągu 3-30 sekund wyświetla:
   - ✅ Sukces z numerem KSeF
   - ❌ Błąd walidacji z listą problemów
   - 🟡 "Sprawdź później" jeśli przetwarzanie trwa dłużej

### **Scenariusz 2: Sprawdzenie statusu wysłanej faktury**
1. Użytkownik wchodzi w fakturę ze statusem "🟡 Wysłana"
2. Widzi numer referencyjny
3. Klika "Odśwież status"
4. System sprawdza aktualny stan w KSeF
5. Jeśli gotowe - wyświetla numer KSeF i datę przyjęcia

### **Scenariusz 3: Pobranie UPO**
1. Użytkownik ma fakturę z numerem KSeF
2. Widzi przycisk "📄 Pobierz UPO"
3. Klika przycisk
4. Plik XML zostaje automatycznie pobrany/otwarty
5. Może zapisać jako dowód wysłania faktury

### **Scenariusz 4: Obsługa duplikatu**
1. Użytkownik próbuje wysłać fakturę, która już jest w KSeF
2. System wykrywa duplikat (kod 440)
3. Wyświetla ostrzeżenie z numerem oryginalnej faktury
4. Nie tworzy nowego wpisu w KSeF

---

## ⚠️ Obsługa Błędów

### **Błędy walidacji (400)**
System wyświetla szczegółową listę problemów:
```
Błąd walidacji:
• Brak numeru NIP nabywcy
• Data wystawienia nie może być w przyszłości
• Wartość netto pozycji 2 jest nieprawidłowa
```

### **Timeout przetwarzania**
Po 10 próbach (30 sekund) system wyświetla:
```
Przetwarzanie trwa dłużej niż zwykle.
Sprawdź status później przyciskiem 'Odśwież status'.
```

### **Błędy serwera**
Wyświetlany jest czytelny komunikat z kodem błędu:
```
Błąd serwera (500): Nie udało się połączyć z KSeF.
Spróbuj ponownie później.
```

---

## 🔍 Jakie okna/ekrany zawierają funkcjonalność KSeF?

### **1. Lista faktur** (`/invoices`)
- Kolumna "KSeF" z badge'ami statusu
- Szybki podgląd stanu integracji dla wszystkich faktur

### **2. Szczegóły faktury** (`/invoice/{id}`)
- Pełna sekcja KSeF na dole ekranu
- Przyciski akcji (Wyślij, Odśwież, Pobierz UPO)
- Szczegółowe informacje o statusie
- Komunikaty błędów i sukcesów

### **3. Edycja faktury** (modal)
- Brak bezpośredniej integracji
- Po zapisaniu - dane KSeF pozostają bez zmian
- Uwaga: Zmiana faktury po wysłaniu do KSeF może wymagać wysłania korekty

---

## 📊 Dane techniczne

### **Stany faktury względem KSeF:**

| Status faktury | ksefNumber | ksefStatus | ksefSessionId | Widoczne przyciski |
|---------------|-----------|-----------|---------------|-------------------|
| Nie wysłana   | null      | null      | null          | "Wyślij do KSeF" |
| Wysłana       | null      | "PENDING" | "xxx-xxx"     | "Odśwież status" |
| Przyjęta      | "123..."  | "200"     | "xxx-xxx"     | "Pobierz UPO" |
| Duplikat      | null      | "440"     | "xxx-xxx"     | - |

### **Endpointy API (podsumowanie):**
1. `POST /invoice/{id}/ksef/send` - Wysyłka faktury
2. `GET /invoice/{id}/ksef/status` - Sprawdzenie statusu
3. `GET /invoice/{id}/ksef/upo` - Pobranie UPO

### **Polling (automatyczne sprawdzanie):**
- Interwał: 3 sekundy
- Max prób: 10 (łącznie 30 sekund)
- Uruchamia się automatycznie po wysłaniu

---

## 💡 Wskazówki dla LLM generującego komunikat

### **Kluczowe informacje do przekazania użytkownikom:**

1. **Co to jest KSeF i dlaczego go wdrażamy?**
   - Obowiązek prawny od lipca 2024
   - Automatyczna archiwizacja faktur
   - UPO jako dowód wystawienia

2. **Gdzie znajdą nową funkcjonalność?**
   - Lista faktur: nowa kolumna "KSeF"
   - Szczegóły faktury: sekcja na dole ekranu

3. **Jak z tego korzystać?**
   - Krok po kroku: wysłanie faktury
   - Co oznaczają statusy (kolory)
   - Kiedy pobierać UPO

4. **Co się zmienia w workflow?**
   - Dodatkowy krok po wystawieniu faktury
   - Automatyczne sprawdzanie - nie trzeba czekać
   - UPO jako załącznik do dokumentacji

5. **Częste pytania/problemy:**
   - Co jeśli błąd walidacji? (sprawdzić dane NIP, daty)
   - Co jeśli "timeout"? (odświeżyć po chwili)
   - Czy można edytować wysłaną fakturę? (lepiej nie - wymagana korekta)

6. **Kontakt w razie problemów:**
   - Do kogo zgłaszać błędy
   - Przykładowe screenshoty/instrukcje

---

## 📸 Sugerowane załączniki graficzne do komunikatu

1. Screenshot listy faktur z kolumną KSeF
2. Screenshot sekcji KSeF w szczegółach faktury (stan "Nie wysłana")
3. Screenshot sekcji KSeF po wysłaniu (stan "Przyjęta")
4. Diagram przepływu: wystawienie → wysłanie → potwierdzenie → UPO

---

## 🚀 Status implementacji

### ✅ **Zrealizowane (Frontend):**
- Kolumna KSeF w liście faktur
- Sekcja KSeF w szczegółach faktury
- Badge'y statusu (KsefStatusBadge)
- Wysyłanie faktury (sendToKsef)
- Automatyczne sprawdzanie statusu (polling)
- Ręczne odświeżanie (refreshStatus)
- Pobieranie UPO (downloadUpo)
- Obsługa błędów i walidacji

### 📝 **Do zrealizowania (Backend):**
- Endpoint: POST /invoice/{id}/ksef/send
- Endpoint: GET /invoice/{id}/ksef/status
- Endpoint: GET /invoice/{id}/ksef/upo
- Integracja z API KSeF (autentykacja, wysyłka)
- Generowanie pliku FA_VAT (XML)
- Zapisywanie statusów w bazie danych

### 🔜 **Przyszłe rozszerzenia (opcjonalne):**
- Masowe wysyłanie faktur do KSeF
- Automatyczne wysyłanie po zmianie statusu na "Wysłana"
- Historia zmian statusu KSeF
- Powiadomienia email o błędach/sukcesach
- Dashboard z statystykami KSeF

---

## 📞 Kontakt techniczny

**Frontend (React/TypeScript):**
- Pliki: `KsefSection.tsx`, `InvoicesSearch.tsx`, `CommonComponents.tsx`
- Typy: `Invoice` w `bussinesTypes.d.ts`

**Backend (do implementacji):**
- Endpointy API KSeF
- Walidacja danych faktury
- Generowanie FA_VAT XML

**Dokumentacja zewnętrzna:**
- API KSeF: https://www.podatki.gov.pl/ksef/
- Specyfikacja FA_VAT: https://www.gov.pl/web/kas/struktury-faktur

---

**Data aktualizacji:** 19 stycznia 2026  
**Wersja dokumentu:** 1.0  
**Autor:** System ENVI.ProjectSite - Implementacja KSeF
