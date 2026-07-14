import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { useNavigate, useParams } from "react-router-dom";
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
};

const PURPOSE_OPTIONS = ["spotkanie", "rada budowy", "tankowanie", "kontrola budowy"];
const GENERAL_CODE = "OGÓLNE";
// Odczyt licznika ze zdjęcia (Google Vision). Wyłączone dopóki Vision API nie jest
// aktywne - ustaw na true, żeby włączyć przycisk aparatu.
const OCR_ENABLED = false;

function today() {
    return new Date().toISOString().slice(0, 10);
}

export default function MileagePage() {
    // Wybór pojazdu jako trasa (#/mileage/:vehicleId) - dzięki temu systemowy
    // przycisk "wstecz" wraca z formularza do listy pojazdów.
    const { vehicleId } = useParams<{ vehicleId?: string }>();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [listError, setListError] = useState("");

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
            <h4 className="mb-3">Kilometrówka</h4>
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
    const [isGeneral, setIsGeneral] = useState(false);
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

    const [scanning, setScanning] = useState(false);
    const [candidates, setCandidates] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const selectedContract = watch("_contract") as OurContract | undefined;
    const driverPerson = watch("_driver") as PersonData | undefined;
    const driver = driverPerson ? `${driverPerson.name} ${driverPerson.surname}` : "";
    const isFueling = purposes.includes("tankowanie");

    // Podpowiedź trasy (3 pola, edytowalne). Backend złoży je w "skąd - przez - dokąd".
    // "przez": miasto kontraktu ma pierwszeństwo (nawet przy tankowaniu); w przeciwnym
    // razie "Brzeg" dla tankowania, a puste dla reszty (backend zwinie do "Brzeg").
    useEffect(() => {
        setRouteFrom("Brzeg");
        setRouteTo("Brzeg");
        const city = isGeneral ? undefined : selectedContract?._city?.name;
        setRouteMid(city ?? (isFueling ? "Brzeg" : ""));
    }, [selectedContract, isGeneral, isFueling]);

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

    useEffect(() => {
        if (isGeneral) setValue("_contract", null);
    }, [isGeneral, setValue]);

    const km = useMemo(() => {
        const s = Number(startReading);
        const e = Number(endReading);
        if (!startReading || !endReading || Number.isNaN(s) || Number.isNaN(e)) return null;
        return e - s;
    }, [startReading, endReading]);

    function purposeText() {
        return purposes.join(", ");
    }

    async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ""; // pozwól wybrać to samo zdjęcie ponownie
        if (!file) return;
        setError("");
        setCandidates([]);
        setScanning(true);
        try {
            const body = new FormData();
            body.append("file", file);
            body.append("vehicleId", vehicle.id);
            if (startReading) body.append("previousEndReading", startReading);
            const res = await fetch(`${MainSetup.serverUrl}mileage/scan-odometer`, {
                method: "POST",
                credentials: "include",
                body,
            });
            if (!res.ok) throw new Error("Nie udało się odczytać licznika.");
            const { candidates } = await res.json();
            if (!candidates?.length) {
                setError("Nie rozpoznano stanu licznika na zdjęciu — wpisz ręcznie.");
            } else if (candidates.length === 1) {
                setEndReading(String(candidates[0]));
            } else {
                setCandidates(candidates);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setScanning(false);
        }
    }

    function validate(): string | null {
        if (!driver.trim()) return "Wybierz kierującego pojazdem.";
        if (!isGeneral && !selectedContract) return "Wybierz kontrakt lub zaznacz OGÓLNE.";
        if (!date) return "Podaj datę wyjazdu.";
        if (!purposeText()) return "Wybierz cel wyjazdu.";
        if (!startReading || !endReading) return "Podaj stan licznika początkowy i końcowy.";
        if (km != null && km < 0) return "Stan końcowy nie może być mniejszy od początkowego.";
        return null;
    }

    async function handleSubmit() {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError("");
        setSuccess("");
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
                    projectOurId: isGeneral ? GENERAL_CODE : selectedContract?.ourId,
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
            setSuccess(`Zapisano wpis Lp. ${trip.lp} (${trip.km} km).`);
            // Reset do kolejnego wpisu: nowy stan początkowy = właśnie zapisany końcowy
            setStartReading(endReading);
            setEndReading("");
            setPurposes([]);
            setFuelingDate("");
            setFuelingReading("");
            setFuelingReadingTouched(false);
            setFuelingDateTouched(false);
            setValue("_contract", null);
            setIsGeneral(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Container className="py-3" style={{ maxWidth: 640 }}>
            <h4 className="mb-3">
                {vehicle.brand}
                {vehicle.model ? ` ${vehicle.model}` : ""} · {vehicle.plate}
            </h4>

            {success && <Alert variant="success">{success}</Alert>}

            <FormProvider value={formMethods}>
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Check
                            type="checkbox"
                            id="mileage-general"
                            label="OGÓLNE (bez kontraktu)"
                            checked={isGeneral}
                            onChange={(e) => setIsGeneral(e.target.checked)}
                        />
                    </Form.Group>
                    {!isGeneral && (
                        <div className="mb-3">
                            <Form.Label>Kontrakt ENVI</Form.Label>
                            <ContractSelector name="_contract" typesToInclude="our" showValidationInfo={false} />
                        </div>
                    )}

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

                    <Form.Group className="mb-3">
                        <Form.Label>Opis trasy (skąd - przez - dokąd)</Form.Label>
                        <Row className="g-2">
                            <Col xs={4}>
                                <Form.Control
                                    value={routeFrom}
                                    onChange={(e) => setRouteFrom(e.target.value)}
                                    placeholder="skąd"
                                />
                            </Col>
                            <Col xs={4}>
                                <Form.Control
                                    value={routeMid}
                                    onChange={(e) => setRouteMid(e.target.value)}
                                    placeholder="przez"
                                />
                            </Col>
                            <Col xs={4}>
                                <Form.Control
                                    value={routeTo}
                                    onChange={(e) => setRouteTo(e.target.value)}
                                    placeholder="dokąd"
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    <Row className="g-2 mb-3">
                        <Col xs={6}>
                            <Form.Label>Stan licznika początkowy</Form.Label>
                            <Form.Control
                                inputMode="numeric"
                                value={startReading}
                                onChange={(e) => setStartReading(e.target.value)}
                            />
                        </Col>
                        <Col xs={6}>
                            <Form.Label>Stan licznika końcowy</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    inputMode="numeric"
                                    value={endReading}
                                    onChange={(e) => setEndReading(e.target.value)}
                                />
                                {OCR_ENABLED && (
                                    <Button
                                        as="label"
                                        variant="outline-primary"
                                        className="text-nowrap mb-0"
                                        disabled={scanning}
                                    >
                                        {scanning ? <Spinner size="sm" /> : "📷"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            hidden
                                            onChange={handleScan}
                                        />
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>
                    {OCR_ENABLED && candidates.length > 1 && (
                        <div className="mb-3">
                            <div className="text-muted small">Wybierz rozpoznaną wartość:</div>
                            <div className="d-flex flex-wrap gap-2 mt-1">
                                {candidates.map((c) => (
                                    <Button
                                        key={c}
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setEndReading(String(c));
                                            setCandidates([]);
                                        }}
                                    >
                                        {c}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

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

                    {isFueling && (
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

                    <div className="mb-3">
                        <RegisteringEditorSelector
                            label="Kierujący pojazdem"
                            name="_driver"
                            fetchRoute="mileage/drivers"
                            showValidationInfo={false}
                        />
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Button className="w-100" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <Spinner size="sm" /> : "Zapisz wpis"}
                    </Button>
                </Form>
            </FormProvider>
        </Container>
    );
}
