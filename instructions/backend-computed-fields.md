# Backend Computed Fields - Node.js/Express

> **Przykłady** jak naprawić warningi z frontendu dodając computed fields w backendzie.

## Problem: Frontend zgłasza brakujące pole

**Konsola przeglądarki:**

```
⚠️ [_contract] Brak wymaganego pola "_ourIdOrNumber_Name"
   receivedKeys: ["id", "ourId", "alias", "name", "createdAt"]
   object: { id: 123, ourId: "ABC-2024", alias: "Kontrakt Testowy", ... }
```

**Co to znaczy?**

-   Backend zwraca obiekt **bez** pola `_ourIdOrNumber_Name`
-   Frontend **potrzebuje** tego pola do wyświetlenia w Typeahead
-   Należy **dodać computed field w backendzie**, NIE na frontendzie

---

## Rozwiązanie 1: W Kontrolerze (Express Router)

### Przed naprawą ❌

```javascript
// routes/contracts.js
router.get("/contracts", async (req, res) => {
    try {
        const contracts = await Contract.find(req.query);
        res.json(contracts); // ❌ Brak _ourIdOrNumber_Name
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Po naprawie ✅

```javascript
// routes/contracts.js
router.get("/contracts", async (req, res) => {
    try {
        const contracts = await Contract.find(req.query);

        // ✅ Dodaj computed field dla każdego kontraktu
        contracts.forEach((contract) => {
            const id = contract.ourId || contract.number || "[Brak ID]";
            const name = contract.alias || contract.name || "[Brak nazwy]";
            contract._ourIdOrNumber_Name = `${id} - ${name}`;
        });

        res.json(contracts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

**Kiedy używać:**

-   Proste computed fields
-   Pole używane tylko w jednym endpoincie
-   Szybka naprawa

---

## Rozwiązanie 2: W Modelu Mongoose (Virtual Field)

### Definicja Modelu

```javascript
// models/Contract.js
const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
    ourId: String,
    number: String,
    alias: String,
    name: String,
    // ...inne pola
});

// ✅ Virtual field - obliczany przy każdym dostępie
contractSchema.virtual("_ourIdOrNumber_Name").get(function () {
    const id = this.ourId || this.number || "[Brak ID]";
    const name = this.alias || this.name || "[Brak nazwy]";
    return `${id} - ${name}`;
});

// ⚠️ WAŻNE: Włącz virtuals w JSON
contractSchema.set("toJSON", { virtuals: true });
contractSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Contract", contractSchema);
```

### Kontroler (bez zmian)

```javascript
// routes/contracts.js
router.get("/contracts", async (req, res) => {
    try {
        const contracts = await Contract.find(req.query);
        res.json(contracts); // ✅ Virtual field automatycznie dodany
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

**Kiedy używać:**

-   Pole używane w **wielu** endpointach
-   Logika biznesowa powinna być w modelu
-   DRY principle - define once, use everywhere

---

## Rozwiązanie 3: Middleware (dla wielu modeli)

Jeśli **wszystkie** obiekty potrzebują podobnych computed fields:

```javascript
// middleware/addComputedFields.js
function addComputedFields(req, res, next) {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
        // Jeśli array obiektów
        if (Array.isArray(data)) {
            data.forEach((item) => {
                if (item.ourId || item.number) {
                    const id = item.ourId || item.number || "[Brak ID]";
                    const name = item.alias || item.name || "[Brak nazwy]";
                    item._ourIdOrNumber_Name = `${id} - ${name}`;
                }
            });
        }
        // Jeśli pojedynczy obiekt
        else if (data && typeof data === "object") {
            if (data.ourId || data.number) {
                const id = data.ourId || data.number || "[Brak ID]";
                const name = data.alias || data.name || "[Brak nazwy]";
                data._ourIdOrNumber_Name = `${id} - ${name}`;
            }
        }

        return originalJson(data);
    };

    next();
}

module.exports = addComputedFields;
```

**Użycie:**

```javascript
// routes/contracts.js
const addComputedFields = require("../middleware/addComputedFields");

router.get("/contracts", addComputedFields, async (req, res) => {
    const contracts = await Contract.find(req.query);
    res.json(contracts); // ✅ Middleware doda _ourIdOrNumber_Name
});
```

**Kiedy używać:**

-   Wiele modeli ma podobną strukturę
-   Centralizacja logiki
-   Łatwe globalne wyłączenie (np. feature flag)

---

## Weryfikacja Naprawy

### 1. Sprawdź Response w Postman/Thunder Client

**Request:**

```
GET http://localhost:3000/api/contracts?searchText=test
```

**Response (przed naprawą):**

```json
[
    {
        "id": 123,
        "ourId": "ABC-2024",
        "alias": "Kontrakt Testowy"
        // ❌ Brak _ourIdOrNumber_Name
    }
]
```

**Response (po naprawie):**

```json
[
    {
        "id": 123,
        "ourId": "ABC-2024",
        "alias": "Kontrakt Testowy",
        "_ourIdOrNumber_Name": "ABC-2024 - Kontrakt Testowy" // ✅
    }
]
```

### 2. Sprawdź Frontend

1. Odśwież przeglądarkę (Ctrl+F5)
2. Otwórz konsolę (F12)
3. Użyj selektora (wpisz tekst do wyszukania)
4. Sprawdź logi:

**Przed naprawą:**

```
⚠️ [_contract] Brak wymaganego pola "_ourIdOrNumber_Name"
```

**Po naprawie:**

```
✅ [_contract] Po walidacji: [...]
🏷️ [_contract] labelKey="_ourIdOrNumber_Name", pierwszy obiekt: { ..., _ourIdOrNumber_Name: "ABC-2024 - Kontrakt Testowy" }
```

---

## Najczęstsze Błędy

### ❌ Błąd 1: Virtual field nie pojawia się w JSON

```javascript
// ❌ Zapomniałeś włączyć virtuals
contractSchema.set("toJSON", { virtuals: true }); // BRAKUJE
```

**Rozwiązanie:**

```javascript
// ✅
contractSchema.set("toJSON", { virtuals: true });
contractSchema.set("toObject", { virtuals: true });
```

### ❌ Błąd 2: Computed field jest obiektem, nie stringiem

```javascript
// ❌ ZŁE - zwraca obiekt
contract._ourIdOrNumber_Name = { id: contract.ourId, name: contract.alias };
```

**Frontend wymaga:**

```javascript
// ✅ DOBRE - zwraca string
contract._ourIdOrNumber_Name = `${contract.ourId} - ${contract.alias}`;
```

### ❌ Błąd 3: Pole dodane tylko w jednym endpoincie

```javascript
// ❌ Dodałeś w GET /contracts
router.get('/contracts', ...);  // ✅ Ma _ourIdOrNumber_Name

// ❌ Ale zapomniałeś w POST /contracts/search
router.post('/contracts/search', ...);  // ❌ Brak _ourIdOrNumber_Name
```

**Rozwiązanie:** Użyj **Virtual field w modelu** lub **middleware** - automatycznie działa wszędzie.

---

## Wzorzec dla Innych Pól

**Szablon:**

```javascript
// Dla dowolnego computed field (Person._nameSurnameEmail, Project._ourId_Alias, etc.)

// 1. Model (Virtual)
personSchema.virtual("_nameSurnameEmail").get(function () {
    const name = this.name || "[Brak imienia]";
    const surname = this.surname || "[Brak nazwiska]";
    const email = this.email || "[Brak email]";
    return `${name} ${surname} <${email}>`;
});

// 2. Lub w kontrolerze
persons.forEach((person) => {
    const name = person.name || "[Brak imienia]";
    const surname = person.surname || "[Brak nazwiska]";
    const email = person.email || "[Brak email]";
    person._nameSurnameEmail = `${name} ${surname} <${email}>`;
});
```

**Zasada:** Computed field = **string** zbudowany z istniejących pól.

---

## Podsumowanie

| Podejście      | Gdzie dodać kod       | Zalety                      | Wady                       | Kiedy używać               |
| -------------- | --------------------- | --------------------------- | -------------------------- | -------------------------- |
| **Kontroler**  | `routes/contracts.js` | Szybkie, proste             | Duplikacja w wielu routach | Quick fix, 1 endpoint      |
| **Model**      | `models/Contract.js`  | DRY, działa wszędzie        | Mongoose-specific          | Wiele endpointów, reusable |
| **Middleware** | `middleware/*.js`     | Centralizacja, wielu modeli | Może być over-engineering  | Globalna logika, feature   |

**Rekomendacja:** Start z **Model Virtual** - najczystsze rozwiązanie.
