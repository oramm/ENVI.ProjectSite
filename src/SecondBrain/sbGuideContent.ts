/**
 * Cały tekst przewodnika „Jak to działa” (plan UZYCIE_SB, SB.RDZEN.01, decyzja B wariant e).
 * Wygląd i geometria rysunków są w `SbHowItWorks.tsx`; tu tylko słowa, kluczowane tymi samymi
 * identyfikatorami, żeby źródło tekstu dało się kiedyś podmienić bez przepisywania komponentów.
 *
 * Reguły treści: każde zdanie to idea albo przykład; bez liczb godzin, wersji, ścieżek i słów
 * warsztatowych; nazwy skilli poza tekstem; przewodnik nie obiecuje więcej, niż sprawdzono.
 */

export type ScreenId = "mapa" | "u-siebie" | "gdzie" | "przyklady" | "skille" | "dwie-strony" | "zespol";

/** Karta przykładu: co piszesz albo klikasz → co dostajesz → gdzie jest Twoja decyzja. */
export type Example = {
    /** Gdzie to robisz - mały podpis karty. */
    where: string;
    /** Opis kliknięcia, gdy zaczynasz w systemie, a nie od zdania. */
    action?: string;
    /** Zdanie do skopiowania jednym kliknięciem. */
    says?: string;
    gets: string;
    decision: string;
    /** "read" - tylko czyta i niczego nie zapisuje; "write" - zmienia albo zapisuje. */
    kind?: "read" | "write";
    note?: string;
};

export type FlowText = {
    title: string;
    nodes: Record<string, { title: string; sub?: string }>;
    arrows: Record<string, string[]>;
    steps: Record<string, { label: string; text: string; card?: Example }>;
};

export const GUIDE = {
    navLabel: "Ekrany przewodnika",
    backToMap: "Wróć na mapę",
    screenOf: (nr: number, total: number) => `Ekran ${nr} z ${total}`,
    copySentence: "Zdanie dla agenta",
    copy: { idle: "Kopiuj", done: "Skopiowano", failed: "Zaznacz i skopiuj ręcznie" },
    cardFields: { says: "Co piszesz", action: "Co klikasz", gets: "Co dostajesz", decision: "Gdzie jest Twoja decyzja" },
    kinds: { read: "tylko czyta", write: "zmienia albo zapisuje" },
    goTo: "Przejdź do ekranu",
    next: "Dalej",
    postInstall: { before: "Jak otworzyć agenta, mówi część", link: "„Po instalacji - co dalej”" },
};

const EX = {
    teczka: {
        where: "u agenta", kind: "read",
        says: "Od czego zacząć w ZBS.IK.01? Co jest otwarte?",
        gets: "Agent czyta teczkę kontraktu i wskazuje, co czeka na ruch.",
        decision: "Żadnej - agent tylko czyta i niczego nie zapisuje.",
    },
    aplikacja: {
        where: "w systemie",
        action: "Otwierasz kontrakt w PS i poprawiasz jedną datę.",
        gets: "Zmiana jest od razu w systemie, bez agenta.",
        decision: "Zapisujesz sam, w aplikacji.",
    },
    pomoc: {
        where: "przycisk Pomoc w systemie",
        action: "W PS, FIDmanie albo FIN klikasz „Pomoc” i pytasz:",
        says: "Jak dodać sprawę do kontraktu?",
        gets: "Odpowiedź, jak zrobić to w tym systemie.",
        decision: "Robisz to sam, według odpowiedzi.",
    },
    pismo: {
        where: "u agenta", kind: "write",
        says: "Zarejestruj w PS pismo przychodzące z tego maila",
        gets: "Numer pisma i wpis w rejestrze pism PS.",
        decision: "Agent pokazuje, co wpisze, i czeka na Twoje „tak”.",
        note: "Zapis do PS zależy od Twojego dostępu - zapytaj agenta, czy masz go włączony.",
    },
    analiza: {
        where: "w systemie, przy znaku ENVI",
        action: "W systemie klikasz analizę ze znakiem ENVI.",
        gets: "Program ENVI Agent, który instalujesz raz, uruchamia agenta na Twoim komputerze. Agent czyta dokumenty podane przez system i odsyła propozycje ze wskazaniem źródła.",
        decision: "Każdą propozycję przyjmujesz albo odrzucasz.",
    },
} satisfies Record<string, Example>;

export const EXAMPLES: Example[] = [
    EX.teczka,
    {
        where: "u agenta", kind: "read",
        says: "Znajdź w skrzynce maile od zamawiającego z tego tygodnia i streść je",
        gets: "Streszczenie znalezionych maili.",
        decision: "Żadnej - przegląd poczty tylko czyta.",
        note: "Czy masz podłączoną skrzynkę, powie Ci agent.",
    },
    EX.pismo,
    {
        where: "u agenta", kind: "write",
        says: "Zrób wyciąg z umowy (link do Dysku) do teczki NWY.IK.01",
        gets: "Karta dokumentu z linkiem i wyciąg tekstu w teczce; oryginał zostaje na Dysku.",
        decision: "Wskazujesz plik i teczkę.",
    },
    {
        where: "u agenta", kind: "write",
        says: "Załóż teczkę dla kontraktu NWY.IK.01",
        gets: "Nowa teczka projektu w Second Brain.",
        decision: "Podajesz kod kontraktu - agent go nie zgaduje.",
    },
    {
        where: "u agenta", kind: "write",
        says: "Wpisz do PS dane kontraktu z umowy",
        gets: "Numer, daty, wartość i zamawiający w PS.",
        decision: "Agent pokazuje, co wpisze, i czeka na Twoje „tak”.",
        note: "Tę umiejętność może mieć tylko jeden z programów agenta. Jeśli Twój jej nie zna, zapytaj administratora.",
    },
    {
        where: "u agenta", kind: "write",
        says: "Sprawdź tę odpowiedź do zamawiającego, zanim ją wyślę",
        gets: "Pismo oczyszczone ze śladów pracy wewnętrznej.",
        decision: "Wysyłasz Ty, po przeczytaniu poprawionej wersji.",
    },
    {
        where: "u agenta", kind: "write",
        says: "Nie działa mi poczta",
        gets: "Agent prowadzi Cię przez okno ustawień poczty.",
        decision: "Hasło wpisujesz tylko w tym oknie - w rozmowie agent go nie przyjmie.",
    },
];

export const EXAMPLE_FILTERS = { all: "Wszystkie", read: "Tylko czytają", write: "Zmieniają albo zapisują" };

/** Elementy mapy: tytuł, jedno zdanie (co w nim jest i co agent z nim robi) i ekran, do którego prowadzi. */
export const MAP = {
    title: "Mapa: Second Brain i systemy firmy",
    groups: { sb: "Second Brain", systems: "Systemy firmy" },
    links: { talk: "zwykłe zdanie", self: "sam, w aplikacji" },
    nodes: {
        ty: { title: "Ty", screen: "przyklady",
            text: "Mówisz agentowi zwykłym zdaniem, czego potrzebujesz, i decydujesz przed każdym zapisem w systemie." },
        zespol: { title: "Koledzy", screen: "zespol",
            text: "Pracujecie na tych samych teczkach, więc przed dłuższą pracą w jednej dajesz znać zespołowi." },
        agent: { title: "Twój agent", sub: "Claude Code albo Codex", screen: "gdzie",
            text: "Program na Twoim komputerze: czyta wiedzę firmy i sięga do systemów w Twoim imieniu, z Twoimi uprawnieniami." },
        kanon: { title: "Kanon", sub: "40_wiki", screen: "u-siebie",
            text: "Sprawdzona wiedza całej firmy; agent ją czyta, a zmienia ją tylko administrator." },
        teczki: { title: "Teczki projektów", sub: "20_projects", screen: "u-siebie",
            text: "Wspólne notatki zespołu o kontraktach i sprawach; agent w nich czyta i zapisuje." },
        skille: { title: "Skille", sub: "sposoby pracy firmy", screen: "skille",
            text: "Spisane sposoby, w jakie w ENVI robi się konkretne rzeczy; agent sam dobiera je do Twojej prośby." },
        ps: { title: "PS", screen: "dwie-strony",
            text: "Dane kontraktów, projektów i spraw oraz rejestr pism; agent je czyta, a zapisuje dopiero po Twoim „tak”." },
        fidman: { title: "FIDman", screen: "dwie-strony",
            text: "System, w którym pracujesz sam; ma przycisk Pomoc, a tam, gdzie widzisz znak ENVI, także analizę przez agenta." },
        fin: { title: "FIN", screen: "dwie-strony",
            text: "System, w którym pracujesz sam; ma przycisk Pomoc, a tam, gdzie widzisz znak ENVI, także analizę przez agenta." },
        dysk: { title: "Dysk Google", screen: "u-siebie",
            text: "Oryginały dokumentów: umowy, pisma, skany; agent czyta je z Twoimi uprawnieniami, a w teczce zostawia wyciąg z linkiem." },
        poczta: { title: "Poczta", screen: "przyklady",
            text: "Twoja skrzynka; agent przegląda i streszcza maile, gdy go o to poprosisz - zapytaj go, czy masz ją podłączoną." },
    } satisfies Record<string, { title: string; sub?: string; screen: ScreenId; text: string }>,
};

export type MapNodeId = keyof typeof MAP.nodes;

export const DOORS = {
    agent: { title: "Agent", lines: ["dokumenty, poczta,", "kilka kroków", "albo „nie wiem jak”"], card: EX.teczka },
    aplikacja: { title: "Aplikacja", lines: ["przeglądasz", "i poprawiasz", "pojedyncze dane"], card: EX.aplikacja },
    pomoc: { title: "Pomoc", lines: ["„jak to zrobić", "na tym ekranie?”", "w PS, FIDmanie, FIN"], card: EX.pomoc },
} satisfies Record<string, { title: string; lines: string[]; card: Example }>;

export type DoorId = keyof typeof DOORS;

export const SYNC = {
    title: "Znak ENVI przy zegarze",
    tray: "pasek zadań",
    hint: "Nie widzisz znaku? Windows chowa nowe ikony pod strzałką przy zegarze - przeciągnij go raz na pasek.",
    states: {
        ok: { word: "[OK]", look: "zielony, nieruchomy", text: "Wszystko wysłane, nic nie czeka." },
        pracuje: { word: "[PRACUJE]", look: "zielony, obraca się", text: "Program wysyła Twoje zmiany i pobiera cudze; krótki obrót bez Twojego kliknięcia jest normalny." },
        czeka: { word: "[CZEKA]", look: "żółty, z kropką w rogu", text: "Coś czeka na Twoją decyzję: kliknij znak i wybierz pozycję z listy." },
        stop: { word: "[STOP]", look: "czerwony, przekreślony", text: "Synchronizacja stoi: kliknij znak, a gdy lista nie pomaga, opisz to agentowi." },
        brak: { word: "[BRAK DANYCH]", look: "szary, z kreską", text: "Program nie wie, co się dzieje z plikami." },
    },
};

export type SyncState = keyof typeof SYNC.states;

export const FLOWS = {
    uSiebie: {
        title: "Co masz u siebie i skąd bierze się wiedza",
        nodes: {
            admin: { title: "Administrator" },
            kanon: { title: "Kanon", sub: "40_wiki" },
            teczki: { title: "Teczki projektów", sub: "20_projects" },
            ty: { title: "Ty i agent" },
            dysk: { title: "Dysk Google" },
            ps: { title: "PS" },
        },
        arrows: {
            read: ["czytasz"], write: ["piszesz"], drive: ["karta z linkiem"], ps: ["dane"],
            promote: ["to, co trwałe"], publish: [], report: ["zgłoszenie"],
        },
        steps: {
            calosc: { label: "Całość", text: "Wiedza dojrzewa w teczce projektu, a to, co trwałe, trafia do kanonu." },
            czytasz: { label: "Kanon czytasz", text: "Kanon jest wspólny dla całej firmy, dlatego u Ciebie jest tylko do czytania." },
            piszesz: { label: "W teczce piszesz", text: "Teczki są wspólne: Ty, koledzy i agent zapisujecie w nich notatki i wyciągi." },
            dysk: { label: "Oryginały na Dysku", text: "Umowa zostaje na Dysku Google, w teczce jest jej karta z linkiem i wyciąg, a dane kontraktu są w PS." },
            kanon: { label: "Teczka → kanon", text: "To, co przyda się całej firmie, administrator przenosi z teczki do kanonu." },
            blad: { label: "Błąd w kanonie", text: "Widzisz błąd w kanonie - zgłaszasz go przez agenta, a nie poprawiasz sam." },
        },
    },
    skille: {
        title: "Jak agent korzysta ze skilli",
        nodes: { ty: { title: "Ty" }, agent: { title: "Twój agent" }, skille: { title: "Skille" }, wynik: { title: "Wynik" } },
        arrows: { ask: ["prośba"], confirm: ["„tak”?"], recipe: ["spisany", "sposób"], work: ["krok", "po kroku"], request: ["brakuje?", "zgłoś"] },
        steps: {
            calosc: { label: "Całość", text: "Prośba, dobór skilla, praca krok po kroku i Twoja decyzja przed zapisem." },
            prosba: { label: "Prośba", text: "Mówisz, co chcesz osiągnąć, a nie jak to zrobić." },
            dobor: { label: "Dobór", text: "Agent sam znajduje spisany sposób firmy, który pasuje do prośby." },
            kroki: { label: "Krok po kroku", text: "Pracuje według tego sposobu i pokazuje, co znalazł." },
            decyzja: { label: "Twoja decyzja", text: "Przed zapisem w systemie pokazuje, co zapisze, i czeka na Twoje „tak”." },
            zgloszenie: { label: "Brakuje skilla", text: "Robisz coś często, a agent tego nie umie - zgłoś to, a powstanie skill." },
        },
    },
    dwieStrony: {
        title: "Agent i aplikacje: dwie strony",
        nodes: {
            rozmowa: { title: "Ty i agent" },
            app: { title: "PS · FIDman · FIN" },
            program: { title: "ENVI Agent", sub: "na Twoim komputerze" },
        },
        arrows: { zapis: ["zapis", "po „tak”"], analiza: ["dokumenty", "i propozycje"] },
        steps: {
            calosc: { label: "Całość", text: "Rozmowa może skończyć się zapisem w aplikacji, a aplikacja może poprosić agenta o analizę." },
            rozmowa: { label: "Z rozmowy do aplikacji", text: "Mówisz agentowi, a on wpisuje do PS pismo albo dane kontraktu.", card: EX.pismo },
            aplikacja: { label: "Z aplikacji do agenta", text: "Tam, gdzie widzisz znak ENVI, system przekazuje dokumenty agentowi i dostaje propozycje ze źródłem.", card: EX.analiza },
        },
    },
    zespol: {
        title: "Dwie osoby, jedna teczka",
        nodes: { ty: { title: "Ty" }, chat: { title: "Chat zespołu" }, kolega: { title: "Kolega" }, teczka: { title: "Wspólna teczka" } },
        arrows: { tyChat: ["wiadomość"], chatKolega: [], tyTeczka: [], kolegaTeczka: [] },
        steps: {
            calosc: { label: "Całość", text: "Dwie osoby pracują w jednej teczce i umawiają się na Chacie zespołu." },
            biore: { label: "„Biorę na dziś”", text: "Zanim zaczniesz dłużej pracować w teczce, piszesz na Chacie zespołu, że ją bierzesz." },
            praca: { label: "Pracujesz", text: "Kolega wie, że teczka jest zajęta, i czeka albo się z Tobą umawia." },
            zwalniam: { label: "„Zwalniam”", text: "Po pracy piszesz, że teczka jest wolna." },
        },
    },
} satisfies Record<string, FlowText>;

/** Ekrany w kolejności: krótka nazwa do paska, tytuł, najwyżej pięć zdań i jedno zdanie dla agenta. */
export const SCREENS: { id: ScreenId; short: string; title: string; lead: string[]; copy: string }[] = [
    {
        id: "mapa", short: "Mapa", title: MAP.title,
        lead: [
            "Ty rozmawiasz, agent sięga po resztę.",
            "Second Brain to wspólna pamięć firmy i zestaw instrukcji, z których korzysta Twój agent.",
            "Systemy zostają tam, gdzie były - Second Brain je łączy.",
            "Kliknij element mapy, żeby zobaczyć, co w nim jest.",
        ],
        copy: "Opowiedz mi, jak działa nasz Second Brain i od czego mam zacząć w mojej pracy.",
    },
    {
        id: "u-siebie", short: "Co masz u siebie", title: "Co masz u siebie i skąd bierze się wiedza",
        lead: [
            "W folderze Second Brain widzisz dwa miejsca: 40_wiki, czyli kanon, i 20_projects, czyli teczki projektów.",
            "Przejdź kroki pod rysunkiem: co czytasz, gdzie piszesz i jak wiedza dojrzewa.",
        ],
        copy: "Co wiemy o kontrakcie NWY.IK.01? Streść, co jest w teczce i w kanonie.",
    },
    {
        id: "gdzie", short: "Gdzie z czym", title: "Gdzie z czym: agent, aplikacja czy Pomoc",
        lead: [
            "Masz coś do zrobienia - wybierz drzwi według sytuacji.",
            "Pracujesz w tym programie agenta, który masz; gdy agent mówi, że czegoś nie umie, zapytaj administratora, czy ta umiejętność jest w drugim programie.",
            "Szczegółów systemów przewodnik nie tłumaczy - robi to Pomoc w każdym z nich.",
        ],
        copy: "Do czego możesz mi się przydać przy kontrakcie ZBS.IK.01?",
    },
    {
        id: "przyklady", short: "Przykłady", title: "Przykłady: co piszesz i co dostajesz",
        lead: [
            "Piszesz zwykłym zdaniem, jak do kolegi z zespołu.",
            "Skopiuj zdanie i podstaw kod swojego kontraktu.",
            "Karty oznaczone okiem tylko czytają; przy zapisie do PS agent najpierw pokazuje, co wpisze, i czeka na Twoje „tak”.",
            "Na koniec poproś agenta, żeby sam pokazał, co jeszcze umie.",
        ],
        copy: "Pokaż mi, co jeszcze umiesz - wypisz moje skille z jednym przykładem zdania do każdego.",
    },
    {
        id: "skille", short: "Skille", title: "Skille: skąd agent wie, jak to się u nas robi",
        lead: [
            "Skill to spisany sposób, w jaki w ENVI robi się konkretną rzecz.",
            "Nazw skilli nie musisz znać - agent dobiera je sam do Twojego zdania.",
        ],
        copy: "Jakie masz skille do pracy z pismami i do czego służą?",
    },
    {
        id: "dwie-strony", short: "Dwie strony", title: "Dwie strony: z rozmowy do aplikacji i z aplikacji do agenta",
        lead: [
            "Agent i aplikacje firmy współpracują w obie strony.",
            "Kliknij kierunek pod rysunkiem.",
        ],
        copy: "Czy mam włączony zapis do PS?",
    },
    {
        id: "zespol", short: "Zespół i kłopoty", title: "Praca w zespole i gdy coś nie działa",
        lead: [
            "Teczka jest wspólna, a rezerwacja na Chacie to umowa między ludźmi - nic jej nie pilnuje samo.",
            "Co dzieje się z Twoimi plikami, mówi znak ENVI przy zegarze.",
            "Gdy coś stoi, najpierw opisz agentowi, co widzisz, a dopiero potem pisz do administratora.",
        ],
        copy: "Sprawdź, czy mój Second Brain jest aktualny i działa.",
    },
];
