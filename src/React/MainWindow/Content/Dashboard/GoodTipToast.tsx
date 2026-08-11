import React, { useState, useEffect, useRef } from "react";
import { Badge, Toast, ToastContainer } from "react-bootstrap";
import { createPortal } from "react-dom";
import { SystemRoleName } from "../../../../../Typings/bussinesTypes";
import MainSetup from "../../../MainSetupReact";
import { fetchModuleAccess } from "../../MainMenu";
import "./GoodTipToast.css";

interface Tip {
    text: string;
    isNew?: boolean;
    category?: "general" | "lettersAi" | "invoices" | "costInvoices" | "mileage" | "letters" | "contracts";
    /** Rady o module, do którego nie każdy ma wejście - bez tego rada trafia do osób,
     * które nie mają nawet pozycji w menu. Brak pola = rada dla wszystkich. */
    roles?: SystemRoleName[];
    /** Dostęp na fladze StaffMembers, nie na roli - rozstrzyga backend (jak w menu). */
    moduleAccess?: "mileage/access" | "cost-invoices/access";
}

const tipCategoryLabels: Record<NonNullable<Tip["category"]>, string> = {
    general: "Ogólne",
    lettersAi: "Rozpoznawanie pism AI",
    invoices: "Faktury",
    costInvoices: "Faktury kosztowe",
    mileage: "Kilometrówka",
    letters: "Pisma",
    contracts: "Kontrakty",
};

const tips: Tip[] = [
    // Ogólne porady
    {
        text: "Używaj krótkich nazw folderów i plików - zamieniaj niektóre słowa na skróty, wyrzucaj zbędne słowa.",
        category: "general",
    },
    {
        text: "Aktualizuj statusy kamieni milowych i kontraktów na bieżąco.",
        category: "general"
    },
    {
        text: "Aktualizuj daty zakończenia kamieni i kontraktów.",
        category: "general"
    },
    {
        text: "Do formularzy zostały dodane nowe przyciski pozwalające na dodawanie nowych elementów (np. sprawy, kontrahentów, miasta) bezpośrednio z poziomu formularza. Szukaj przycisku z ikoną plusa obok pól wyboru.",
        category: "general",
    },
    {
        text: "Jeżeli podwykonawca ma własnego podwykonawcę, możesz to odzwierciedlić zakładając podsprawę.",
        category: "general",
    },
    {
        text: "Przy sprawach są widoczne ikony, po najechaniu kursorem myszy wyświetla się podpowiedź z informacją o tym, co oznacza dana ikona.",
        category: "general",
    },

    // Porady o analizie AI pism
    {
        text: "Rozpoznawanie pism AI uzupełnia: numer pisma, daty, opis, kontrakt. Zawsze sprawdź żółte pola (średnia pewność)!",
        category: "lettersAi",
    },
    {
        text: "Analiza pism AI rozpoznaje już skany. Wszystkie pisma które załączysz powinny być poprawnie rozpoznane.",
        category: "lettersAi",
    },
    {
        text: "Pola zielone = wysoka pewność AI. Pola żółte = sprawdź. Pola szare = brakuje danych, wypełnij.",
        category: "lettersAi",
    },

    // Kilometrówka - moduł na fladze IsDriver, nie na roli
    {
        text: "Kilometrówkę uzupełniaj na bieżąco, najlepiej zaraz po powrocie. Formularz znajdziesz w menu Kontrakty, działa też na telefonie.",
        isNew: true,
        category: "mileage",
        moduleAccess: "mileage/access",
    },
    {
        text: "W kilometrówce nie musisz wpisywać cyfr z klawiatury. Kliknij ikonę mikrofonu przy stanie licznika i podyktuj go. Tak samo podyktujesz miasto docelowe. Za pierwszym razem przeglądarka poprosi o zgodę na mikrofon.",
        isNew: true,
        category: "mileage",
        moduleAccess: "mileage/access",
    },
    {
        text: 'Jeden przejazd rozliczysz na kilka kontraktów naraz, w polu "Kontrakty ENVI" zaznacz wszystkie, których dotyczył. Miasta wybranych kontraktów same wpadną do opisu trasy jako punkty pośrednie. W "Celu wyjazdu" też zaznaczysz kilka pozycji albo wpiszesz własną.',
        isNew: true,
        category: "mileage",
        moduleAccess: "mileage/access",
    },

    // Pisma
    {
        text: 'W menu akcji pisma jest "Odpowiedz". Otwiera rejestrację pisma w kierunku przeciwnym: na przychodzące zakładasz naszą odpowiedź, na wychodzące - odpowiedź kontrahenta. Sam uzupełnia projekt, sprawy, kontrakt, podmiot zamieniony stronami, opis "Odpowiedź na: ..." oraz numer pisma źródłowego.',
        isNew: true,
        category: "letters",
    },
    {
        text: 'Jeżeli umowa ma włączoną "Dokumentację zatwierdzoną", przy piśmie ze sprawy kamienia projektowanie - nadzór zaznaczysz "Dodaj to pismo do Dokumentacji zatwierdzonej". Takie pisma mają w rejestrze zieloną ikonę, a filtrem "Dokumentacja zatwierdzona" wyświetlisz same zatwierdzone albo same pozostałe.',
        isNew: true,
        category: "letters",
    },

    // Kontrakty
    {
        text: 'Umowa ma teraz trzy osobne terminy zamiast jednego pola gwarancji: Gwarancja, Rękojmia oraz "Zgłaszanie wad do", czyli Okres Zgłaszania Wad wg FIDIC - to pole pojawia się tylko przy umowach Żółty i Czerwony. Puste pole znaczy "termin nieustalony", a nie "termin nie występuje". Wszystkie terminy widać w bocznej kolumnie na liście umów.',
        isNew: true,
        category: "contracts",
        roles: MainSetup.CONTRACT_SCOPED_ROLES,
    },
    {
        text: 'Z menu akcji umowy wygenerujesz "Spis spraw" - arkusz Google z drzewem kamienie, sprawy, podsprawy i zadania. Wybierasz statusy (bez zakończonych i archiwalnych albo wszystkie) oraz zakres zadań (wszystkie, tylko moje, wskazanych osób). Arkusz trafia do podfolderu "Spisy spraw" w folderze umowy - ta sama konfiguracja nadpisuje swój arkusz, inna tworzy nowy obok. Spis dla całego projektu zrobisz w oknie zadań.',
        isNew: true,
        category: "contracts",
        roles: MainSetup.CONTRACT_SCOPED_ROLES,
    },
    {
        text: "Rejestrując nową umowę zobaczysz drzewo struktury: kamienie milowe, sprawy i foldery na Dysku. Startowo zaznaczone jest dokładnie to, co powstałoby automatycznie - odznacz, czego nie potrzebujesz, albo dołóż pozycje, które nie tworzą się same. Drzewo pokazuje cały słownik dostępny dla wybranego typu umowy, więc najpierw ustaw typ.",
        isNew: true,
        category: "contracts",
        roles: MainSetup.STAFF_ROLES,
    },
    {
        text: '"Dokumentacja zatwierdzona" to rejestr przy kamieniu projektowanie - nadzór. Włączasz go haczykiem na umowie - opcja jest widoczna tylko dla typów Żółty i Usługa. Po włączeniu w kamieniu powstaje folder "04 Dokumentacja zatwierdzona" wraz z arkuszem-rejestrem.',
        isNew: true,
        category: "contracts",
        roles: MainSetup.STAFF_ROLES,
    },

    // Faktury i KSeF
    {
        text: 'Po ustawieniu statusu "Wysłana" możliwe będzie wysłanie faktury do KSeF. Po pomyślnym przesłaniu możesz pobrać UPO jako potwierdzenie przyjęcia.',
        category: "invoices",
        roles: MainSetup.STAFF_ROLES,
    },
    {
        text: 'Przy dodawaniu nabywcy sprawdź poprawność jego danych. Dane nabywcy widoczne przez witrynę będą widoczne na fakturze w KSeF.',
        category: "invoices",
        roles: MainSetup.STAFF_ROLES,
    },
    {
        text: 'Kliknij "Pobierz z KSeF" aby pobrać nowe faktury kosztowe. Wybierz tryb przyrostowy (zostaną pobrane faktury, od ostatniej aktualizacji) lub weryfikacyjny (wybrany zakres dat), aby upewnić się, czy żadna faktura nie została pominięta.',
        category: "costInvoices",
        roles: MainSetup.STAFF_ROLES,
        moduleAccess: "cost-invoices/access",
    },
    {
        text: "Na fakturze kosztowej możesz oznaczyć stan płatności i sprawdzić rachunek dostawcy na Białej Liście VAT.",
        category: "costInvoices",
        roles: MainSetup.STAFF_ROLES,
        moduleAccess: "cost-invoices/access",
    },
];

interface GoodTipToastProps {
    delay?: number;
}

export function GoodTipToast({ delay = 5000 }: GoodTipToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [tip, setTip] = useState<Tip>({ text: "" });
    const [isPaused, setIsPaused] = useState(false);
    const toastWrapperRef = useRef<HTMLDivElement>(null);
    const systemRoleName = MainSetup.currentUserOrNull?.systemRoleName;

    const tipCategoryLabel = tip.category ? tipCategoryLabels[tip.category] : null;
    const displayDuration = tip.isNew ? delay * 2 : delay;

    // Rada jest losowana raz na cały cykl życia komponentu. Bez tej blokady StrictMode
    // (środowisko deweloperskie) uruchamia efekt dwa razy i podmienia radę pod czytającym.
    const tipPickedRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef(0);
    const remainingTimeRef = useRef(displayDuration);

    // Kilometrówka (IsDriver) i faktury kosztowe (HasCostInvoiceAccess) stoją na flagach
    // StaffMembers, nie na roli - o dostępie rozstrzyga backend, te same odpowiedzi gaszą
    // pozycje w menu. O faktury kosztowe pytamy tylko pracowników ENVI (jak MainMenu),
    // żeby logowanie ról zakresowych nie zostawiało w logach wpisów o odmowie.
    // Losujemy dopiero po obu odpowiedziach: na niepełnej wiedzy rady modułowe nigdy by
    // nie wypadły, a dolosowanie ich później podmieniałoby radę pod czytającym.
    useEffect(() => {
        const isStaff = MainSetup.isRoleAllowed(MainSetup.STAFF_ROLES);
        Promise.all([
            fetchModuleAccess("mileage/access"),
            isStaff ? fetchModuleAccess("cost-invoices/access") : Promise.resolve(false),
        ]).then(([mileageAccess, costInvoicesAccess]) => {
            if (tipPickedRef.current) return;
            tipPickedRef.current = true;

            const moduleAccess = {
                "mileage/access": mileageAccess,
                "cost-invoices/access": costInvoicesAccess,
            };
            // Rada bez ograniczeń jest dla wszystkich; z ograniczeniem musi przejść oba
            // warunki, bo rola i flaga modułu odpowiadają na różne pytania.
            const availableTips = tips.filter((currentTip) => {
                if (currentTip.roles && !(systemRoleName && currentTip.roles.includes(systemRoleName))) return false;
                if (currentTip.moduleAccess && !moduleAccess[currentTip.moduleAccess]) return false;
                return true;
            });

            // ponytail: bez zapasu na pustą listę - rady ogólne nie mają ograniczeń, więc widzi je każdy.
            const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
            remainingTimeRef.current = randomTip.isNew ? delay * 2 : delay;
            setTip(randomTip);
            setTimeout(() => setIsVisible(true), 100);
        });
    }, [delay, systemRoleName]);

    useEffect(() => {
        if (!isVisible) return;

        if (isPaused) {
            if (timerRef.current) clearTimeout(timerRef.current);
            const elapsedTime = Date.now() - startTimeRef.current;
            remainingTimeRef.current -= elapsedTime;
        } else {
            startTimeRef.current = Date.now();
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setIsVisible(false), remainingTimeRef.current);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [displayDuration, isPaused, isVisible]);

    useEffect(() => {
        if (!isVisible || isPaused) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return;
        }

        const intervalTime = 50;
        progressIntervalRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTimeRef.current;
            const totalElapsedTime = displayDuration - remainingTimeRef.current + elapsedTime;
            const percentage = (totalElapsedTime / displayDuration) * 100;

            if (toastWrapperRef.current) {
                toastWrapperRef.current.style.setProperty("--progress-width", `${Math.min(percentage, 100)}%`);
            }

            if (totalElapsedTime >= displayDuration) {
                if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            }
        }, intervalTime);

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [displayDuration, isPaused, isVisible]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <ToastContainer
            position="bottom-end"
            className="p-3"
            style={{ zIndex: 1050, overflowX: "hidden", position: "fixed", right: 0, bottom: 0 }}
        >
            <div ref={toastWrapperRef} className={`good-tip-toast-wrapper ${isVisible ? "show" : "hide"}`}>
                <Toast
                    onClose={() => setIsVisible(false)}
                    show={true}
                    autohide={false}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Dobra rada</strong>
                        {tipCategoryLabel && (
                            <Badge bg="secondary" text="light" pill className="ms-2 text-uppercase">
                                {tipCategoryLabel}
                            </Badge>
                        )}
                        {tip.isNew && (
                            <Badge bg="info" text="light" pill className="ms-2">
                                nowe
                            </Badge>
                        )}
                    </Toast.Header>
                    <Toast.Body className="good-tip-toast-body">{tip.text}</Toast.Body>
                </Toast>
            </div>
        </ToastContainer>,
        document.body,
    );
}
