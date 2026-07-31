# Development Environment Setup

## 📋 Spis Treści

1. [Quick Start](#-quick-start)
2. [Environment Variables (.env)](#-environment-variables-env)
3. [Available Scripts](#-available-scripts)
4. [Dev Login / Mock Authentication](#-dev-login--mock-authentication)
5. [Security Guidelines](#-security-guidelines)
6. [Puppeteer / Playwright Testing](#-puppeteer--playwright-testing)

---

## 🚀 Quick Start

### Dla nowego dewelopera

```bash
# 1. Clone repo
git clone [repo-url]
cd ENVI.ProjectSite

# 2. Skopiuj .env.example i dostosuj
cp .env.example .env

# 3. Zainstaluj zależności
yarn install

# 4. Uruchom dev server
yarn start
# Frontend b�dzie dost�pny na http://localhost:9000/docs/
```

---

## 🔐 Environment Variables (.env)

### Frontend `.env` (główny katalog projektu)

```bash
# Development mode
MODE=development

# Włącz dev login (mock authentication dla testów)
ENABLE_DEV_LOGIN=true
```

### Backend `Server/.env` (katalog Server)

```bash
# Node environment
NODE_ENV=development

# Włącz dev login na backendzie
ENABLE_DEV_LOGIN=true
```

### ⚠️ Bezpieczeństwo

- **`.env` jest w `.gitignore`** - nigdy nie commituj tego pliku!
- Użyj `.env.example` jako template dla innych deweloperów
- Klucze API, hasła, tokeny → TYLKO w `.env`, NIGDY w kodzie
- Na produkcji: `NODE_ENV=production`, `ENABLE_DEV_LOGIN=false`

---

## 📦 Available Scripts

Zdefiniowane w `package.json`:

### Development

```bash
# Uruchom webpack-dev-server (port 9000) pod URL /docs/
yarn start

# Alternatywny dev server
yarn dev
```

### Build

```bash
# Pełny build (clean + TypeScript + webpack + copy files)
yarn build

# Tylko czyszczenie katalogu docs
yarn clean

# Tylko kopiowanie plików statycznych
yarn copy-files

# Tylko kopiowanie .htaccess
yarn copy-htaccess
```

### Testing / Screenshots

```bash
# Zrób screenshot domyślnej trasy aplikacji pod localhost:9000/docs/#/
yarn screenshot

# Screenshot konkretnej strony
node scripts/screenshot.js http://localhost:9000/docs/#/other-page tmp/ui-browser-loop/other-page.png

# Screenshot z custom nazwą
node scripts/screenshot.js http://localhost:9000/docs/#/persons tmp/ui-browser-loop/persons.png

# Screenshot z automatycznym mock logowaniem (kliknie pomarańczowy przycisk DEV, jeśli widoczny)
node scripts/screenshot.js http://localhost:9000/docs/#/persons tmp/ui-browser-loop/persons-logged.png --mock-login

# Dłuższy timeout (gdy ekran ładuje dane)
node scripts/screenshot.js http://localhost:9000/docs/#/contracts tmp/ui-browser-loop/contracts.png --timeout=60000

# Screenshot kontraktu testowego z ustalonym readiness check
yarn screenshot:contract

# Cleanup po zakończeniu iteracji UI
yarn screenshot:cleanup
```

### Workflow

```
yarn start = codzienny development (HMR, bez recznego yarn build po zmianach UI)
yarn build = clean -> TypeScript compilation -> webpack -> copy files (walidacja/publikacja)
yarn screenshot = wrapper do scripts/screenshot.js z domyślną trasą/outputem w tmp/ui-browser-loop
yarn screenshot:* = tymczasowa weryfikacja UI; artefakty zostają w tmp/ui-browser-loop i powinny być usunięte po sprawdzeniu
```

### Ustalony kontekst dla UI Browser Loop

- aplikacja działa lokalnie pod `http://localhost:9000/docs/#/...`
- frontend komunikuje się z backendem na `http://localhost:3000`
- przed restartem procesów sprawdzaj, czy porty `9000` i `3000` nie są już zajęte przez działające serwery
- `scripts/screenshot.js` wspiera `--mock-login`, `--timeout`, `--viewport`, `--selector`, `--text` do stabilnej weryfikacji
- zrzuty ekranu są tymczasowe i nie mogą być commitowane
- jeśli agent startuje z repo `PS-nodeJS`, używaj tamtejszego cienkiego adaptera, ale canonical docs pozostają tutaj

---

## 🔧 Dev Login / Mock Authentication

### Cel

Pozwala na szybkie testowanie aplikacji **bez** Google OAuth podczas:

- Developmentu lokalnego
- Testów automatycznych (Playwright, Puppeteer)
- Debugowania

### Jak to działa?

1. **Frontend** wyświetla pomarańczowy przycisk "🔧 DEV: Mock Login (Playwright)"
2. **Backend** akceptuje request z `dev_mode: true` i tworzy mock session
3. **Bezpieczeństwo:** działa tylko gdy `NODE_ENV=development` + `ENABLE_DEV_LOGIN=true`

### Quick Setup

#### 1. Frontend (już skonfigurowane ✅)

Plik `.env` zawiera:

```bash
ENABLE_DEV_LOGIN=true
```

#### 2. Backend (do dodania w Twoim projekcie)

##### Dodaj do `Server/.env`:

```bash
NODE_ENV=development
ENABLE_DEV_LOGIN=true
```

##### Zaktualizuj `ToolsGapi.ts` - metodę `loginHandler`:

Dodaj **na początku** metody (przed weryfikacją Google OAuth):

```typescript
static async loginHandler(req: Request, res: Response) {
    try {
        // ⚠️ DEV MODE: Check for mock authentication
        const { dev_mode, mock_user } = req.body;

        if (dev_mode === true) {
            // SECURITY: Only allow in development with explicit flag
            if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_DEV_LOGIN !== 'true') {
                throw new Error('Dev mode login is not allowed in this environment');
            }

            console.warn('🔧 DEV MODE: Mock authentication - bypassing Google OAuth');

            // Mock user data for Playwright/testing
            req.session.userData = {
                enviId: 1,
                googleId: 'mock-google-id-playwright',
                systemEmail: 'playwright@test.local',
                userName: mock_user || 'Playwright Test User',
                picture: 'https://www.gravatar.com/avatar/?d=mp',
                systemRoleName: 'ADMIN',
                systemRoleId: 1,
            };

            console.log('🔧 DEV: Mock user data set in session:', req.session.userData);
            return; // Exit early, skip Google OAuth
        }

        // Reszta normalnego kodu (Google OAuth)...
```

#### 3. Użycie

```bash
# Otwórz aplikację
open http://localhost:9000/docs/

# Kliknij pomarańczowy przycisk: "🔧 DEV: Mock Login (Playwright)"
# Gotowe! Jesteś zalogowany jako Playwright Test User
```

### Różne role testowe (opcjonalnie)

Możesz rozszerzyć kod aby testować różne role:

```typescript
// GoogleLoginButton.tsx
<button onClick={() => handleDevLogin('ADMIN')}>Dev: Admin</button>
<button onClick={() => handleDevLogin('EMPLOYEE')}>Dev: Employee</button>

async function handleDevLogin(role: string) {
    const response = await fetch(MainSetup.serverUrl + 'login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            dev_mode: true,
            mock_user: `Test ${role}`,
            mock_role: role
        }),
    });
    // ...
}
```

Backend:

```typescript
systemRoleName: req.body.mock_role || 'ADMIN',
```

### Wyłączanie Dev Mode

**Frontend:**

```bash
# .env
ENABLE_DEV_LOGIN=false

# Zrestartuj dev server
yarn start
```

**Backend:**

```bash
# Server/.env
ENABLE_DEV_LOGIN=false
# lub
NODE_ENV=production
```

---

## 🛡️ Security Guidelines

### ✅ Bezpieczne do push na GitHub

- `.env.example` - template bez sekretów
- `webpack.config.mjs` - tylko przekazuje zmienne środowiskowe
- `GoogleLoginButton.tsx` - sprawdza flagę `ENABLE_DEV_LOGIN`
- `ToolsGapi.loginHandler` - waliduje `NODE_ENV` + `ENABLE_DEV_LOGIN`
- Wszystkie pliki `.md` w `instructions/`

### ❌ NIGDY nie pushuj

- `.env` - zmienne środowiskowe z sekretami
- `Server/.env` - backend credentials
- Klucze API, tokeny, hasła w kodzie
- Pliki tymczasowe z `tmp/ui-browser-loop/`
- `node_modules/` (już w `.gitignore`)

### Checklist przed commit

1. Sprawdź `git status` - czy nie ma `.env` na liście?
2. Czy nie ma hardcoded credentials w kodzie?
3. Czy nowe sensitive pliki są w `.gitignore`?

### Produkcja (Heroku / inne)

```bash
# .env na produkcji
NODE_ENV=production
ENABLE_DEV_LOGIN=false  # lub usuń całkowicie
```

---

## 🎭 Puppeteer / Playwright Testing

### Setup Puppeteer

```bash
# Zainstaluj Puppeteer
npm install puppeteer

# Stwórz skrypt screenshot.js (przykład poniżej)
```

### Przykład: Screenshot z Puppeteer

```bash
# Użyj gotowego skryptu
yarn screenshot

# Zobacz kod w scripts/screenshot.js
```

Skrypt znajduje się w `scripts/screenshot.js` i wspiera parametry:

- URL (default: http://localhost:9000/docs/#/)
- Nazwa pliku output (default: tmp/ui-browser-loop/ui-browser-loop.png)

### Setup Playwright

```bash
# Zainstaluj Playwright
npm init playwright@latest

# Uruchom codegen (interaktywny recording)
npx playwright codegen http://localhost:9000/docs/
```

### Przykładowy test E2E

```typescript
// tests/login.spec.ts
import { test, expect } from "@playwright/test";

test("dev login works", async ({ page }) => {
    await page.goto("http://localhost:9000/docs/");

    // Kliknij dev login button
    await page.click('button:has-text("DEV: Mock Login")');

    // Poczekaj na zalogowanie
    await page.waitForTimeout(1000);

    // Sprawdź czy zalogowano
    await expect(page.locator("text=Playwright Test User")).toBeVisible();
});
```

### Troubleshooting

**Puppeteer nie startuje?**

```bash
# Windows
# Sprawdź czy Chrome jest zainstalowany
# Puppeteer pobiera własną wersję Chromium automatycznie
```

**Playwright timeout?**

```bash
# Zwiększ timeout
await page.goto('url', { waitUntil: 'networkidle0', timeout: 30000 });
```

---

## 📚 Powiązane Dokumenty

- [AI_GUIDELINES.md](./AI_GUIDELINES.md) - Wytyczne dla AI agents
- [README.md](./README.md) - Nawigacja po dokumentacji

---

## 🤝 Onboarding - Checklist dla nowego dev

- [ ] Clone repo
- [ ] Skopiuj `.env.example` → `.env`
- [ ] Przeczytaj sekcję [Security Guidelines](#-security-guidelines)
- [ ] Uruchom `yarn install`
- [ ] Uruchom `yarn start` i sprawd� http://localhost:9000/docs/
- [ ] Przeczytaj [AI_GUIDELINES.md](./AI_GUIDELINES.md) jeśli pracujesz z AI
- [ ] Przeczytaj [README.md](./README.md) - mapę dokumentacji

Gotowe! Możesz zacząć pracę. 🚀
