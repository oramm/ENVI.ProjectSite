import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faCarSide } from "@fortawesome/free-solid-svg-icons";
import { flushSync } from "react-dom";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FormProvider } from "../View/Modals/FormContext";
import {
    ContractSelector,
    RegisteringEditorSelector,
} from "../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import MainSetup from "../React/MainSetupReact";
import { OurContract, PersonData } from "../../Typings/bussinesTypes";

type Vehicle = {
    id: string;
    brand: string;
    model: string;
    plate: string;
    currentReading: number | null;
    sheetUrl?: string;
};

const PURPOSE_OPTIONS = ["spotkanie", "rada budowy", "tankowanie", "kontrola budowy", "zakupy"];
const GENERAL_CODE = "OGÓLNE";

function today() {
    return new Date().toISOString().slice(0, 10);
}

// Rozpoznawanie mowy (Web Speech API) - kierowca dyktuje cyfry. Mapujemy słowa-cyfry
// na cyfry i wyrzucamy resztę; obsługuje też przypadek gdy Chrome zwróci już cyfry.
const WORD_DIGIT: Record<string, string> = {
    zero: "0", jeden: "1", jedna: "1", dwa: "2", dwie: "2", trzy: "3",
    cztery: "4", pięć: "5", sześć: "6", siedem: "7", osiem: "8", dziewięć: "9",
};
const spokenToDigits = (t: string) =>
    t.toLowerCase().split(/\s+/).map((w) => WORD_DIGIT[w] ?? w).join(" ").replace(/\D/g, "");

const SpeechRecognitionCtor: any =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

// Przycisk dyktowania: w spoczynku obrys, podczas nagrywania czerwony i pulsujący zamiast mylącego spinnera.
function VoiceButton({
    active,
    onClick,
    hint,
}: {
    active: boolean;
    onClick: () => void;
    hint: string;
}) {
    return (
        <Button
            variant={active ? "danger" : "outline-primary"}
            className="text-nowrap"
            onClick={onClick}
            title={active ? "Nagrywanie... kliknij, aby zatrzymać" : hint}
        >
            <FontAwesomeIcon icon={faMicrophone} beatFade={active} />
        </Button>
    );
}

export default function MileagePage() {
    // Wybór pojazdu jako trasa (#/mileage/:vehicleId) - dzięki temu systemowy
    // przycisk "wstecz" wraca z formularza do listy pojazdów.
    const { vehicleId } = useParams<{ vehicleId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [listError, setListError] = useState("");
    // Komunikat po zapisie wpisu (ze stanu nawigacji z formularza). Czytany wprost
    // w renderze, więc jest już w DOM listy w chwili snapshotu View Transition -
    // wjeżdża razem z listą, zamiast "wyskakiwać" po animacji.
    const savedState = location.state as
        | { savedMsg?: string; sheetUrl?: string; driveCar?: boolean }
        | null;
    const savedMsg = savedState?.savedMsg ?? "";
    const savedSheetUrl = savedState?.sheetUrl;
    // Auto renderujemy wprost w renderze (jak komunikat), by trafiło do snapshotu
    // View Transition. Odpoczywa poza ekranem, więc po animacji jest niewidoczne.
    const driveCar = !!savedState?.driveCar;

    // Wyczyść stan historii, by odświeżenie strony (F5) nie pokazało komunikatu ponownie.
    useEffect(() => {
        if (savedMsg) window.history.replaceState({}, "");
    }, [location.key]);

    function loadVehicles() {
        setLoadingVehicles(true);
        fetch(`${MainSetup.serverUrl}mileage/vehicles`, { credentials: "include" })
            .then((r) => r.json())
            .then(setVehicles)
            .catch(() => setListError("Nie udało się pobrać listy pojazdów."))
            .finally(() => setLoadingVehicles(false));
    }

    // Ładuje na wejściu i po powrocie do listy (świeży stan licznika po wpisie).
    useEffect(loadVehicles, [vehicleId]);

    // Manifest PWA (instalowalność) tylko na tej zakładce i tylko na urządzeniach
    // dotykowych (telefony/tablety) - żeby opcja "Zainstaluj aplikację" nie pojawiała
    // się na pozostałych ekranach ERP ani na desktopie.
    useEffect(() => {
        const isMobile = window.matchMedia("(pointer: coarse)").matches;
        if (!isMobile) return;
        const link = document.createElement("link");
        link.rel = "manifest";
        link.href = "manifest.webmanifest";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const selectedVehicle = vehicleId
        ? vehicles.find((v) => String(v.id) === vehicleId) ?? null
        : null;

    if (vehicleId) {
        if (selectedVehicle) return <MileageForm vehicle={selectedVehicle} />;
        return (
            <Container className="py-3" style={{ maxWidth: 640 }}>
                {loadingVehicles ? (
                    <div className="text-center py-5">
                        <Spinner />
                    </div>
                ) : (
                    <Alert variant="danger">Nie znaleziono pojazdu.</Alert>
                )}
            </Container>
        );
    }

    return (
        <Container className="py-3" style={{ maxWidth: 720 }}>
            <style>{`
                ::view-transition-old(root) {
                    animation: 1500ms cubic-bezier(0.4, 0, 0.2, 1) both mileageSlideOut;
                }
                ::view-transition-new(root) {
                    animation: 1500ms cubic-bezier(0.4, 0, 0.2, 1) both mileageSlideIn;
                }
                @keyframes mileageSlideOut { to { transform: translateX(-100%); } }
                @keyframes mileageSlideIn { from { transform: translateX(100%); } }

                /* Auto: spoczywa poza ekranem (translateX(-120vw) = niewidoczne po animacji),
                   a w warstwie View Transition przejeżdża po wierzchu przez cały ekran. */
                .mileage-drive-car {
                    position: fixed;
                    top: 50%;
                    left: 0;
                    transform: translate(-120vw, -50%);
                    view-transition-name: mileage-car;
                    font-size: 7rem;
                    color: var(--bs-primary, #0d6efd);
                    filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.15));
                    pointer-events: none;
                    z-index: 9999;
                }
                /* Animujemy zawartość (-new), nie grupę - grupa trzyma wyśrodkowanie w pionie,
                   a auto rusza względem swojej pozycji spoczynkowej (-120vw): 230vw..55vw
                   daje netto 110vw..-65vw, czyli przejazd z prawej za lewą krawędź - auto
                   znika całkiem poza ekranem, bez zatrzymania w połowie. */
                ::view-transition-new(mileage-car) {
                    animation: 1500ms cubic-bezier(0.4, 0, 0.2, 1) both mileageCarDrive;
                }
                @keyframes mileageCarDrive {
                    from { transform: translateX(230vw); }
                    to   { transform: translateX(55vw); }
                }
                @media (prefers-reduced-motion: reduce) {
                    ::view-transition-old(root),
                    ::view-transition-new(root),
                    ::view-transition-new(mileage-car) { animation-duration: 0.01ms; }
                }
            `}</style>
            {driveCar && (
                <div className="mileage-drive-car" aria-hidden>
                    <FontAwesomeIcon icon={faCarSide} flip="horizontal" />
                </div>
            )}
            <h4 className="mb-3">Kilometrówka</h4>
            {savedMsg && (
                <Alert variant="success">
                    {savedSheetUrl ? (
                        <a
                            href={savedSheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Otwórz arkusz kilometrówki"
                            className="link-body-emphasis link-underline-opacity-25 link-underline-opacity-100-hover"
                        >
                            {savedMsg}
                        </a>
                    ) : (
                        savedMsg
                    )}
                </Alert>
            )}
            {listError && <Alert variant="danger">{listError}</Alert>}
            {loadingVehicles && vehicles.length === 0 ? (
                <div className="text-center py-5">
                    <Spinner />
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {vehicles.map((v) => (
                        <Card
                            key={v.id}
                            className="shadow-sm"
                            role="button"
                            onClick={() => navigate(`/mileage/${v.id}`)}
                        >
                            <Card.Body className="d-flex justify-content-between align-items-center py-4 px-4">
                                <div>
                                    <div className="fs-3 fw-bold">
                                        {v.brand}
                                        {v.model ? ` ${v.model}` : ""}
                                    </div>
                                    <div className="text-muted">{v.plate}</div>
                                </div>
                                <div className="text-end">
                                    <div className="small text-muted">Stan licznika</div>
                                    <div className="fs-2 fw-bold">
                                        {v.currentReading != null
                                            ? v.currentReading.toLocaleString("pl-PL")
                                            : "—"}{" "}
                                        km
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
}

function MileageForm({ vehicle }: { vehicle: Vehicle }) {
    const formMethods = useForm({ mode: "onChange" });
    const { watch, setValue } = formMethods;

    const [date, setDate] = useState(today());
    const [purposes, setPurposes] = useState<string[]>([]);
    const [routeFrom, setRouteFrom] = useState("Brzeg");
    const [routeMid, setRouteMid] = useState("");
    const [routeTo, setRouteTo] = useState("Brzeg");
    const [startReading, setStartReading] = useState<string>(
        vehicle.currentReading != null ? String(vehicle.currentReading) : ""
    );
    const [endReading, setEndReading] = useState<string>("");
    const [fuelingDate, setFuelingDate] = useState("");
    const [fuelingReading, setFuelingReading] = useState("");
    // Pola tankowania śledzą wartości domyślne (końcowy/data), dopóki użytkownik
    // ich ręcznie nie zmieni - inaczej wpisywanie końcowego cyfra po cyfrze
    // blokowałoby stan tankowania na pierwszej cyfrze.
    const [fuelingReadingTouched, setFuelingReadingTouched] = useState(false);
    const [fuelingDateTouched, setFuelingDateTouched] = useState(false);

    // Które pole aktualnie nagrywa (np. "reading", "dest") - null gdy cisza.
    const [listeningField, setListeningField] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const selectedContracts = (watch("_contracts") as OurContract[] | undefined) ?? [];
    const driverPerson = watch("_driver") as PersonData | undefined;
    const driver = driverPerson ? `${driverPerson.name} ${driverPerson.surname}` : "";
    const isFueling = purposes.includes("tankowanie");
    const navigate = useNavigate();

    // Telefon/tablet lub zainstalowana aplikacja.
    const isTouchOrApp = useMemo(
        () =>
            window.matchMedia("(pointer: coarse)").matches ||
            window.matchMedia("(display-mode: standalone)").matches,
        []
    );
    // Przełącznik "Pełny formularz" (tylko mobile) pozwala wymusić widok jak na desktopie.
    const [showFullForm, setShowFullForm] = useState(false);
    // Uproszczony widok: kontrakt, trasa (skąd/dokąd), stan początkowy, data, kierowca
    // i pola tankowania ukryte - wysyłane są wartości domyślne (pusty kontrakt,
    // Brzeg-...-Brzeg, poprzedni licznik, dziś, zalogowany użytkownik jako kierowca).
    const simplified = isTouchOrApp && !showFullForm;

    // Switch "Pełny formularz" pokazuje się z napisem, po 5s zwija się do samego
    // suwaka (napis "zjadany" przez zwijający się kontener).
    const [switchCollapsed, setSwitchCollapsed] = useState(false);
    useEffect(() => {
        if (!isTouchOrApp) return;
        const t = setTimeout(() => setSwitchCollapsed(true), 5000);
        return () => clearTimeout(t);
    }, [isTouchOrApp]);

    // Podpowiedź trasy (3 pola, edytowalne). Backend złoży je w "skąd - przez - dokąd".
    // "przez": miasto kontraktu ma pierwszeństwo (nawet przy tankowaniu); w przeciwnym
    // razie "Brzeg" dla tankowania, a puste dla reszty (backend zwinie do "Brzeg").
    // Miasta wszystkich wybranych kontraktów (bez powtórzeń) - string, więc nadaje się
    // na zależność efektu (tablica z watch() jest nowa przy każdym renderze).
    const contractCities = [
        ...new Set(selectedContracts.map((contract) => contract._city?.name).filter(Boolean)),
    ].join(" - ");

    useEffect(() => {
        setRouteFrom("Brzeg");
        setRouteTo("Brzeg");
        setRouteMid(contractCities || (isFueling ? "Brzeg" : ""));
    }, [contractCities, isFueling]);

    // Domyślne dane tankowania: stan = końcowy, data = data wyjazdu - dopóki
    // użytkownik ręcznie nie zmieni pola. Po odznaczeniu tankowania - reset.
    useEffect(() => {
        if (isFueling) {
            if (!fuelingReadingTouched) setFuelingReading(endReading);
            if (!fuelingDateTouched) setFuelingDate(date);
        } else {
            setFuelingReadingTouched(false);
            setFuelingDateTouched(false);
        }
    }, [isFueling, endReading, date, fuelingReadingTouched, fuelingDateTouched]);

    const km = useMemo(() => {
        const s = Number(startReading);
        const e = Number(endReading);
        if (!startReading || !endReading || Number.isNaN(s) || Number.isNaN(e)) return null;
        return e - s;
    }, [startReading, endReading]);

    function purposeText() {
        // Brak wybranego celu = domyślnie "spotkanie".
        return purposes.length ? purposes.join(", ") : "spotkanie";
    }

    // Zwolnij mikrofon przy opuszczeniu formularza (gdyby sesja jeszcze trwała).
    useEffect(() => {
        return () => recognitionRef.current?.abort();
    }, []);

    // Klik w mikrofon danego pola: gdy cokolwiek nagrywa - zatrzymaj, inaczej zacznij nasłuch.
    function toggleVoice(field: string, onText: (text: string) => void) {
        if (listeningField) {
            recognitionRef.current?.stop();
            return;
        }
        startVoice(field, onText);
    }

    // Kierowca dyktuje wartość pola - transkrypt oddajemy do onText (cyfry albo miasto).
    function startVoice(field: string, onText: (text: string) => void) {
        if (!SpeechRecognitionCtor) {
            setError("Rozpoznawanie mowy niedostępne w tej przeglądarce.");
            return;
        }
        setError("");
        const rec = new SpeechRecognitionCtor();
        recognitionRef.current = rec;
        rec.lang = "pl-PL";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (e: any) => {
            onText(e.results[0][0].transcript);
            rec.stop(); // zwolnij mikrofon od razu (iOS Safari nie robi tego sam)
        };
        rec.onerror = (e: any) => {
            setListeningField(null);
            // 'aborted' = celowe przerwanie (stop/abort), nie pokazuj jako błąd.
            if (e?.error && e.error !== "aborted")
                setError(`Błąd mikrofonu: ${e.error}`);
        };
        rec.onend = () => setListeningField(null);
        try {
            setListeningField(field);
            rec.start();
        } catch (err) {
            setListeningField(null);
            setError(
                "Nie udało się uruchomić mikrofonu - wymaga HTTPS/localhost i zgody."
            );
        }
    }

    // Transkrypt licznika: słowa-cyfry na cyfry, z komunikatem gdy nic nie rozpoznano.
    function fillReadingFromVoice(text: string) {
        const digits = spokenToDigits(text);
        if (digits) setEndReading(digits);
        else setError(`Nie rozpoznano liczby (usłyszano: "${text}").`);
    }

    function validate(): string | null {
        if (!routeMid.trim()) return "Podaj miasto na trasie";
        if (!endReading) return "Podaj stan licznika końcowy.";
        if (!startReading) return "Brak stanu początkowego (poprzedni odczyt).";
        if (km != null && km < 0) return "Stan końcowy nie może być mniejszy od początkowego.";
        // Kierowca wymagany tylko w pełnym formularzu (na mobile fallback backendu).
        // Kontrakt jest opcjonalny - puste pole = OGÓLNE.
        if (!simplified && !driver.trim())
            return "Wybierz kierującego pojazdem.";
        return null;
    }

    async function handleSubmit() {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const res = await fetch(`${MainSetup.serverUrl}mileage/trip`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vehicleId: vehicle.id,
                    date,
                    driver,
                    // Uproszczony (mobile): puste. Pełny: kontrakty po przecinku
                    // (jedna komórka arkusza) lub OGÓLNE gdy nic nie wybrano.
                    projectOurId: simplified
                        ? ""
                        : selectedContracts
                              .map((contract) => contract.ourId)
                              .filter(Boolean)
                              .join(", ") || GENERAL_CODE,
                    purpose: purposeText(),
                    routeParts: [routeFrom, routeMid, routeTo],
                    startReading: Number(startReading),
                    endReading: Number(endReading),
                    fuelingDate: isFueling ? fuelingDate : "",
                    fuelingReading: isFueling && fuelingReading ? Number(fuelingReading) : "",
                }),
            });
            if (!res.ok) throw new Error("Nie udało się zapisać wpisu.");
            const trip = await res.json();

            const via = routeMid.trim();
            const savedMsg = `Zapisano wpis Lp. ${trip.lp} (${trip.km} km)${
                via ? ` przez ${via}` : ""
            }.`;
            // Zapis potwierdzony. Przejście na listę robimy przez View Transitions API:
            // przeglądarka sama animuje wjazd listy i wyjazd formularza (bez białych ekranów),
            // a auto (osobny view-transition-name) przejeżdża po wierzchu.
            const startVT = (document as any).startViewTransition?.bind(document);
            const goToList = () =>
                navigate("/mileage", {
                    state: { savedMsg, sheetUrl: vehicle.sheetUrl, driveCar: !!startVT },
                });
            if (startVT) {
                startVT(() => flushSync(goToList));
            } else {
                goToList();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSubmitting(false);
        }
    }

    const vehicleDisplayName = (
        <>
            {vehicle.brand}
            {vehicle.model ? ` ${vehicle.model}` : ""}
            {!isTouchOrApp && ` · ${vehicle.plate}`}
        </>
    );

    return (
        <Container className="py-3" style={{ maxWidth: 640 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0 text-truncate" style={{ maxWidth: "70%" }}>
                    {vehicle.sheetUrl ? (
                        <a
                            href={vehicle.sheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Otwórz arkusz kilometrówki"
                            className="link-body-emphasis link-underline-opacity-25 link-underline-opacity-100-hover text-truncate d-inline-block"
                        >
                            {vehicleDisplayName}
                        </a>
                    ) : (
                        vehicleDisplayName
                    )}
                </h4>
                {isTouchOrApp && (
                    <div
                        title="Pełny formularz"
                        className="d-flex align-items-center"
                        style={{ gap: "0.5rem" }}
                    >
                        <span
                            className="small text-muted"
                            style={{
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                maxWidth: switchCollapsed ? 0 : "10rem",
                                opacity: switchCollapsed ? 0 : 1,
                                transition: "max-width 0.7s ease, opacity 0.7s ease",
                            }}
                        >
                            Pełny formularz
                        </span>
                        <Form.Check
                            type="switch"
                            id="mileage-full-form"
                            className="mb-0"
                            checked={showFullForm}
                            onChange={(e) => setShowFullForm(e.target.checked)}
                        />
                    </div>
                )}
            </div>

            <FormProvider value={formMethods}>
                <Form>
                    {!simplified && (
                        <Form.Group className="mb-3">
                            <Form.Label>Cel wyjazdu</Form.Label>
                            <Typeahead
                                id="mileage-purpose"
                                multiple
                                allowNew
                                newSelectionPrefix="Inne: "
                                options={PURPOSE_OPTIONS}
                                selected={purposes}
                                onChange={(sel) =>
                                    setPurposes(
                                        sel.map((s: any) => (typeof s === "string" ? s : s.label))
                                    )
                                }
                                placeholder="Wybierz lub wpisz cel(e) wyjazdu..."
                            />
                        </Form.Group>
                    )}

                    {!simplified && (
                        <div className="mb-3">
                            <Form.Label>
                                Kontrakty ENVI{" "}
                                <span className="text-muted small">(puste = OGÓLNE)</span>
                            </Form.Label>
                            <ContractSelector
                                name="_contracts"
                                typesToInclude="our"
                                showValidationInfo={false}
                                multiple
                                limit={5}
                            />
                        </div>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Opis trasy{simplified ? "" : " (skąd - przez - dokąd)"}
                        </Form.Label>
                        {simplified ? (
                            // Backend złoży "Brzeg - {to pole} - Brzeg"
                            <div className="d-flex gap-2">
                                <Form.Control
                                    value={routeMid}
                                    onChange={(e) => setRouteMid(e.target.value)}
                                    placeholder="Dokąd"
                                />
                                {SpeechRecognitionCtor && (
                                    <VoiceButton
                                        active={listeningField === "dest"}
                                        onClick={() =>
                                            toggleVoice("dest", (t) =>
                                                setRouteMid(t.trim())
                                            )
                                        }
                                        hint="Podyktuj miasto docelowe"
                                    />
                                )}
                            </div>
                        ) : (
                            <Row className="g-2">
                                <Col xs={3}>
                                    <Form.Control
                                        value={routeFrom}
                                        onChange={(e) => setRouteFrom(e.target.value)}
                                        placeholder="skąd"
                                    />
                                </Col>
                                <Col xs={6}>
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            value={routeMid}
                                            onChange={(e) => setRouteMid(e.target.value)}
                                            placeholder="przez"
                                        />
                                        {SpeechRecognitionCtor && (
                                            <VoiceButton
                                                active={listeningField === "dest"}
                                                onClick={() =>
                                                    toggleVoice("dest", (t) =>
                                                        setRouteMid(t.trim())
                                                    )
                                                }
                                                hint="Podyktuj miasto (przez)"
                                            />
                                        )}
                                    </div>
                                </Col>
                                <Col xs={3}>
                                    <Form.Control
                                        value={routeTo}
                                        onChange={(e) => setRouteTo(e.target.value)}
                                        placeholder="dokąd"
                                    />
                                </Col>
                            </Row>
                        )}
                    </Form.Group>

                    <Row className="g-2 mb-3">
                        {!simplified && (
                            <Col xs={6}>
                                <Form.Label>Stan licznika początkowy</Form.Label>
                                <Form.Control
                                    inputMode="numeric"
                                    value={startReading}
                                    onChange={(e) => setStartReading(e.target.value)}
                                />
                            </Col>
                        )}
                        <Col xs={simplified ? 12 : 6}>
                            <Form.Label>Stan licznika końcowy</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    inputMode="numeric"
                                    value={endReading}
                                    onChange={(e) => setEndReading(e.target.value)}
                                />
                                {SpeechRecognitionCtor && (
                                    <VoiceButton
                                        active={listeningField === "reading"}
                                        onClick={() =>
                                            toggleVoice("reading", fillReadingFromVoice)
                                        }
                                        hint="Podyktuj cyfry stanu licznika"
                                    />
                                )}
                            </div>
                        </Col>
                    </Row>

                    {!simplified && (
                        <Row className="g-2 mb-3">
                            <Col xs={6}>
                                <Form.Label>Data wyjazdu</Form.Label>
                                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </Col>
                            <Col xs={6}>
                                <Form.Label>Ilość km</Form.Label>
                                <Form.Control value={km ?? ""} readOnly disabled />
                            </Col>
                        </Row>
                    )}

                    {!simplified && isFueling && (
                        <Row className="g-2 mb-3">
                            <Col xs={6}>
                                <Form.Label>Data tankowania</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fuelingDate}
                                    onChange={(e) => {
                                        setFuelingDate(e.target.value);
                                        setFuelingDateTouched(true);
                                    }}
                                />
                            </Col>
                            <Col xs={6}>
                                <Form.Label>Licznik - tankowanie</Form.Label>
                                <Form.Control
                                    inputMode="numeric"
                                    value={fuelingReading}
                                    onChange={(e) => {
                                        setFuelingReading(e.target.value);
                                        setFuelingReadingTouched(true);
                                    }}
                                />
                            </Col>
                        </Row>
                    )}

                    {!simplified && (
                        <div className="mb-3">
                            <RegisteringEditorSelector
                                label="Kierujący pojazdem"
                                name="_driver"
                                fetchRoute="mileage/drivers"
                                showValidationInfo={false}
                            />
                        </div>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Button className="w-100" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <Spinner size="sm" /> : "Zapisz wpis"}
                    </Button>
                </Form>
            </FormProvider>
        </Container>
    );
}
