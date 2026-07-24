import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Badge,
    Button,
    ButtonGroup,
    Card,
    Col,
    Container,
    Form,
    Modal,
    Row,
    Spinner,
} from "react-bootstrap";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCamera,
    faMicrophone,
    faPen,
    faXmark,
    faLocationDot,
    faCircleInfo,
    faListCheck,
    faHelmetSafety,
    faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import MainSetup from "../React/MainSetupReact";
import ToolsDate from "../React/Tools/ToolsDate";
import { GDFolderIconLink, MapIconButton } from "../View/Resultsets/CommonComponents";
import PhotoAnnotator from "./PhotoAnnotator";

type ContractOption = {
    id: number;
    ourId: string | null;
    number: string | null;
    name: string;
    status: string;
    gdFolderId: string | null;
    cityName: string | null;
    ourIdRelated: string | null;
    typeName: string | null;
};

type Photo = {
    id: string;
    file: Blob;
    name: string;
    url: string;
    takenAt: string | null;
    lat: number | null;
    lon: number | null;
    acc: number | null;
};

type VisitPhoto = {
    id: number;
    gdFileId: string;
    fileName: string | null;
    takenAt: string | null;
    latitude: number | null;
    longitude: number | null;
};

type Visit = {
    id: number;
    contractId: number;
    description: string | null;
    visitedAt: string;
    _contractLabel?: string;
    _authorName?: string;
    _gdFolderUrl?: string;
    _photos?: VisitPhoto[];
};

type Filters = { dateFrom: string; dateTo: string; text: string };
const EMPTY_FILTERS: Filters = { dateFrom: "", dateTo: "", text: "" };

const api = (path: string) => `${MainSetup.serverUrl}${path}`;
// Proxy podglądu zdjęcia przez backend (pliki na GD nie są publiczne).
const photoUrl = (gdFileId: string) => api(`site-visits/photo/${gdFileId}`);
// Data z bazy (ISO) w czytelnym formacie przez współdzielony moduł dat.
const fmtDate = (v: string) => ToolsDate.dateToDDmmmYYYYHHMM(v);

function qs(params: Record<string, string | number | undefined>): string {
    const u = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== null) u.append(k, String(v));
    });
    const s = u.toString();
    return s ? `?${s}` : "";
}

function pad(n: number) {
    return String(n).padStart(2, "0");
}
// 'YYYY-MM-DD HH:mm:ss' w czasie lokalnym urządzenia.
function nowStr() {
    const d = new Date();
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
}

// Rozpoznawanie mowy (Web Speech API) - dyktowanie opisu (Chrome/secure context).
const SpeechRecognitionCtor: any =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

// GPS w chwili dodania zdjęć (best-effort - null gdy odmowa/brak).
function getPosition(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
        );
    });
}

// Manifest PWA "Wizyty na budowie" (osobna instalowalna ikona) - tylko na
// urządzeniach dotykowych i tylko w obrębie tego modułu.
function useVisitsManifest() {
    useEffect(() => {
        const isMobile = window.matchMedia("(pointer: coarse)").matches;
        if (!isMobile) return;
        const link = document.createElement("link");
        link.rel = "manifest";
        link.href = "visits.webmanifest";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);
}

export default function SiteVisitsPage() {
    const { contractId } = useParams<{ contractId?: string }>();
    const location = useLocation();
    useVisitsManifest();

    if (location.pathname.endsWith("/admin")) return <VisitsAdmin />;
    if (location.pathname.endsWith("/list")) return <VisitsList />;
    if (contractId) return <CaptureScreen contractId={Number(contractId)} />;
    return <ContractPicker />;
}

// ----------------------------------------------------------------------------
// Wybór budowy
// ----------------------------------------------------------------------------
function ContractPicker() {
    const navigate = useNavigate();
    const location = useLocation();
    const [contracts, setContracts] = useState<ContractOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const savedMsg = (location.state as { savedMsg?: string } | null)?.savedMsg;

    useEffect(() => {
        if (savedMsg) window.history.replaceState({}, "");
    }, [location.key]);

    useEffect(() => {
        fetch(api("site-visits/contracts"), { credentials: "include" })
            .then((r) => {
                if (r.status === 401 || r.status === 403)
                    throw new Error("Brak uprawnień do rejestru wizyt na budowie.");
                if (!r.ok) throw new Error("Nie udało się pobrać listy kontraktów.");
                return r.json();
            })
            .then(setContracts)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Container className="py-3" style={{ maxWidth: 720 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                    <FontAwesomeIcon icon={faHelmetSafety} className="me-2 text-success" />
                    Wizyty na budowie
                </h4>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/visits/list")}
                >
                    <FontAwesomeIcon icon={faListCheck} className="me-1" />
                    Moje wizyty
                </Button>
            </div>

            {savedMsg && <Alert variant="success">{savedMsg}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner />
                </div>
            ) : contracts.length === 0 && !error ? (
                <Alert variant="info">
                    Brak przypisanych aktywnych kontraktów do rejestrowania wizyt.
                </Alert>
            ) : (
                <div className="d-flex flex-column gap-3">
                    <p className="text-muted mb-0">Wybierz budowę, aby dodać wizytę:</p>
                    {contracts.map((c) => (
                        <Card
                            key={c.id}
                            className="shadow-sm"
                            role="button"
                            onClick={() => navigate(`/visits/${c.id}`)}
                        >
                            <Card.Body className="py-3 px-4 d-flex justify-content-between align-items-center">
                                <div>
                                    {c.ourId ? (
                                        // Kontrakt wewnętrzny: OurId · nazwa
                                        <div className="fw-bold fs-5">
                                            {c.ourId} · {c.name}
                                        </div>
                                    ) : (
                                        // Kontrakt zewnętrzny: nazwa na górze, a pod spodem
                                        // mniejszą czcionką "typ numer ➔ powiązany wewnętrzny"
                                        // (jak w drzewie "Projekty i zadania").
                                        <>
                                            <div className="fw-bold fs-5">{c.name}</div>
                                            <div className="text-muted small">
                                                {[c.typeName, c.number]
                                                    .filter(Boolean)
                                                    .join(" ")}{" "}
                                                ➔ {c.ourIdRelated || "Brak powiązania"}
                                            </div>
                                        </>
                                    )}
                                    {c.cityName && (
                                        <div className="text-muted small">
                                            <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                                            {c.cityName}
                                        </div>
                                    )}
                                </div>
                                <FontAwesomeIcon
                                    icon={faCirclePlus}
                                    className="text-success ms-3"
                                    size="2x"
                                    title="Dodaj wizytę"
                                />
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
}

// ----------------------------------------------------------------------------
// Ekran rejestracji wizyty (aparat + siatka zdjęć + opis + GPS)
// ----------------------------------------------------------------------------
function CaptureScreen({ contractId }: { contractId: number }) {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const recognitionRef = useRef<any>(null);

    const [contractLabel, setContractLabel] = useState("");
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [description, setDescription] = useState("");
    const [editing, setEditing] = useState<string | null>(null); // id zdjęcia w edycji
    const [listening, setListening] = useState(false);
    const [gpsBusy, setGpsBusy] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [error, setError] = useState("");

    // Etykieta kontraktu (i re-walidacja dostępu) z listy dostępnych.
    useEffect(() => {
        fetch(api("site-visits/contracts"), { credentials: "include" })
            .then((r) => (r.ok ? r.json() : []))
            .then((list: ContractOption[]) => {
                const c = list.find((x) => x.id === contractId);
                if (!c) {
                    setError("Brak dostępu do tego kontraktu.");
                    return;
                }
                setContractLabel(`${c.ourId ? c.ourId + " · " : ""}${c.name}`);
            })
            .catch(() => setError("Nie udało się wczytać kontraktu."));
    }, [contractId]);

    // Zwolnij zasoby (podglądy, mikrofon) przy opuszczeniu ekranu.
    useEffect(() => {
        return () => {
            photos.forEach((p) => URL.revokeObjectURL(p.url));
            recognitionRef.current?.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        e.target.value = ""; // pozwól ponownie wybrać ten sam plik
        if (files.length === 0) return;

        setGpsBusy(true);
        const pos = await getPosition();
        setGpsBusy(false);

        const added: Photo[] = files.map((file) => {
            // Czas WYKONANIA (lastModified pliku), nie czas uploadu. Wstawiamy go w
            // nazwę pliku ('YYYY-MM-DD_HH-mm-ss ...'), żeby był widoczny na Dysku
            // niezależnie od tego, kiedy plik trafił na GD (Dysk pokazuje czas uploadu).
            const takenAt = file.lastModified
                ? nowFromEpoch(file.lastModified)
                : nowStr();
            const stamp = takenAt.replace(" ", "_").replace(/:/g, "-");
            const baseName = file.name || "zdjecie.jpg";
            return {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                file,
                name: `${stamp} ${baseName}`,
                url: URL.createObjectURL(file),
                takenAt,
                lat: pos?.coords.latitude ?? null,
                lon: pos?.coords.longitude ?? null,
                acc: pos?.coords.accuracy ?? null,
            };
        });
        setPhotos((prev) => [...prev, ...added]);
    }

    function removePhoto(id: string) {
        setPhotos((prev) => {
            const target = prev.find((p) => p.id === id);
            if (target) URL.revokeObjectURL(target.url);
            return prev.filter((p) => p.id !== id);
        });
    }

    // Zapis zaznaczeń z anotatora - podmiana bloba na wersję z rysunkiem.
    function onAnnotated(id: string, blob: Blob) {
        setPhotos((prev) =>
            prev.map((p) => {
                if (p.id !== id) return p;
                URL.revokeObjectURL(p.url);
                return { ...p, file: blob, url: URL.createObjectURL(blob) };
            })
        );
        setEditing(null);
    }

    function toggleVoice() {
        if (listening) {
            recognitionRef.current?.stop();
            return;
        }
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
        rec.onresult = (ev: any) => {
            const text = ev.results[0][0].transcript;
            setDescription((prev) => (prev ? `${prev} ${text}` : text));
            rec.stop();
        };
        rec.onerror = (ev: any) => {
            setListening(false);
            if (ev?.error && ev.error !== "aborted")
                setError(`Błąd mikrofonu: ${ev.error}`);
        };
        rec.onend = () => setListening(false);
        try {
            setListening(true);
            rec.start();
        } catch {
            setListening(false);
            setError("Nie udało się uruchomić mikrofonu (wymaga HTTPS i zgody).");
        }
    }

    async function handleSubmit() {
        if (photos.length === 0) {
            setError("Dodaj co najmniej jedno zdjęcie.");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("contractId", String(contractId));
            fd.append("description", description);
            fd.append("visitedAt", nowStr());
            fd.append(
                "photosMeta",
                JSON.stringify(
                    photos.map((p) => ({
                        takenAt: p.takenAt,
                        latitude: p.lat,
                        longitude: p.lon,
                        gpsAccuracy: p.acc,
                    }))
                )
            );
            photos.forEach((p) => fd.append("photos", p.file, p.name));

            const res = await fetch(api("site-visits"), {
                method: "POST",
                credentials: "include",
                body: fd,
            });
            if (!res.ok) {
                // Globalny handler serwera zwraca { errorMessage }.
                const msg = await res.json().catch(() => null);
                throw new Error(
                    msg?.errorMessage || msg?.error || "Nie udało się zapisać wizyty."
                );
            }
            const result = await res.json();
            navigate("/visits", {
                state: {
                    savedMsg: `Zapisano wizytę (${result.photoCount} zdj.).`,
                },
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSubmitting(false);
        }
    }

    const editingPhoto = editing ? photos.find((p) => p.id === editing) : null;
    const withGps = photos.filter((p) => p.lat != null).length;

    return (
        <Container className="py-3" style={{ maxWidth: 720 }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="mb-0 text-truncate">{contractLabel || "Wizyta"}</h5>
                <Button
                    variant="link"
                    className="p-0 text-muted"
                    title="Instrukcja"
                    onClick={() => setShowHelp((s) => !s)}
                >
                    <FontAwesomeIcon icon={faCircleInfo} size="lg" />
                </Button>
            </div>

            {showHelp && (
                <Alert variant="light" className="border small">
                    <strong>Jak opisać wizytę:</strong>
                    <ul className="mb-0 ps-3">
                        <li>Zrób zdjęcia tego, co istotne - postęp, usterki, uwagi.</li>
                        <li>Jeden opis może dotyczyć jednego lub wielu zdjęć.</li>
                        <li>Zapisz swoje spostrzeżenia i wnioski, nie tylko co widać.</li>
                        <li>Palcem możesz zaznaczyć miejsce na zdjęciu (ikona ołówka).</li>
                    </ul>
                </Alert>
            )}

            {/* Bez atrybutu capture - telefon pokazuje natywny wybór Aparat/Galeria/Pliki
                (capture wymuszałby od razu aparat). Na komputerze i tak jest eksplorator. */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onFilesSelected}
            />

            <Button
                className="w-100 mb-3 py-3"
                variant="success"
                onClick={() => fileInputRef.current?.click()}
                disabled={gpsBusy}
            >
                <FontAwesomeIcon icon={faCamera} className="me-2" />
                {gpsBusy ? "Pobieranie lokalizacji…" : "Zrób / dodaj zdjęcia"}
            </Button>

            {photos.length > 0 && (
                <div
                    className="mb-3"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: 8,
                    }}
                >
                    {photos.map((p) => (
                        <div
                            key={p.id}
                            className="position-relative"
                            style={{ aspectRatio: "1 / 1" }}
                        >
                            <img
                                src={p.url}
                                alt=""
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: 6,
                                }}
                            />
                            <Button
                                size="sm"
                                variant="dark"
                                className="position-absolute top-0 end-0 m-1 p-1 lh-1 opacity-75"
                                title="Usuń zdjęcie"
                                onClick={() => removePhoto(p.id)}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </Button>
                            <Button
                                size="sm"
                                variant="light"
                                className="position-absolute bottom-0 start-0 m-1 p-1 lh-1 opacity-75"
                                title="Zaznacz na zdjęciu"
                                onClick={() => setEditing(p.id)}
                            >
                                <FontAwesomeIcon icon={faPen} />
                            </Button>
                            {p.lat != null && (
                                <span
                                    className="position-absolute bottom-0 end-0 m-1 badge bg-success opacity-75 p-1"
                                    title="Zapisano lokalizację GPS"
                                >
                                    <FontAwesomeIcon icon={faLocationDot} />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Form.Group className="mb-2">
                <Form.Label className="d-flex justify-content-between align-items-center">
                    <span>Opis wizyty</span>
                    {SpeechRecognitionCtor && (
                        <Button
                            variant={listening ? "danger" : "outline-primary"}
                            size="sm"
                            onClick={toggleVoice}
                            title={listening ? "Nagrywanie… kliknij, aby zatrzymać" : "Podyktuj opis"}
                        >
                            <FontAwesomeIcon icon={faMicrophone} beatFade={listening} />
                        </Button>
                    )}
                </Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz co widać i swoje uwagi… (może dotyczyć wielu zdjęć)"
                />
            </Form.Group>

            {photos.length > 0 && (
                <div className="small text-muted mb-3">
                    {photos.length} zdj. · lokalizacja: {withGps}/{photos.length}
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
                className="w-100 py-2"
                onClick={handleSubmit}
                disabled={submitting || photos.length === 0}
            >
                {submitting ? <Spinner size="sm" /> : "Zatwierdź wizytę"}
            </Button>

            {editingPhoto && (
                <PhotoAnnotator
                    src={editingPhoto.url}
                    onSave={(blob) => onAnnotated(editingPhoto.id, blob)}
                    onClose={() => setEditing(null)}
                />
            )}
        </Container>
    );
}

// ----------------------------------------------------------------------------
// Mapa wizyty (leaflet) - pinezka na każde geotagowane zdjęcie
// ----------------------------------------------------------------------------
// Numerowana pinezka (numer = kolejność zdjęcia). divIcon omija problem domyślnych
// ikon leaflet ze ścieżkami przy webpacku i od razu pokazuje, które zdjęcie gdzie.
const numberedIcon = (n: number) =>
    L.divIcon({
        className: "",
        html: `<div style="background:#ea4335;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${n}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
    });

function FitBounds({ points }: { points: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        // Odczekaj aż modal się otworzy, przelicz rozmiar (inaczej szare kafle), dopasuj.
        const t = setTimeout(() => {
            map.invalidateSize();
            if (points.length === 1) map.setView(points[0], 16);
            else if (points.length > 1) map.fitBounds(points, { padding: [30, 30] });
        }, 150);
        return () => clearTimeout(t);
    }, [map, points]);
    return null;
}

function VisitMap({ photos, onClose }: { photos: VisitPhoto[]; onClose: () => void }) {
    // Numer pinezki = numer zdjęcia w karcie (indeks w pełnej liście), więc nawet
    // gdy część zdjęć nie ma GPS, numery na mapie zgadzają się z miniaturami.
    const pts = photos
        .map((p, i) => ({ p, n: i + 1 }))
        .filter((x) => x.p.latitude != null && x.p.longitude != null);
    const center: [number, number] = pts.length
        ? [pts[0].p.latitude!, pts[0].p.longitude!]
        : [52, 19];
    return (
        <Modal show onHide={onClose} fullscreen>
            <Modal.Header closeButton>
                <Modal.Title className="fs-6">Lokalizacje zdjęć</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <MapContainer
                    center={center}
                    zoom={15}
                    style={{ height: "100%", minHeight: "70vh", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap"
                    />
                    {pts.map(({ p, n }) => (
                        <Marker
                            key={p.id}
                            position={[p.latitude!, p.longitude!]}
                            icon={numberedIcon(n)}
                        >
                            <Popup>
                                <div style={{ textAlign: "center" }}>
                                    <div className="small mb-1">Zdjęcie {n}</div>
                                    <img
                                        src={photoUrl(p.gdFileId)}
                                        alt=""
                                        style={{
                                            width: 140,
                                            height: 140,
                                            objectFit: "cover",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    <FitBounds points={pts.map(({ p }) => [p.latitude!, p.longitude!])} />
                </MapContainer>
            </Modal.Body>
        </Modal>
    );
}

// ----------------------------------------------------------------------------
// Karta wizyty (wspólna dla listy własnej i przeglądu)
// ----------------------------------------------------------------------------
function VisitCard({
    visit,
    showAuthor = false,
}: {
    visit: Visit;
    showAuthor?: boolean;
}) {
    const [showMap, setShowMap] = useState(false);
    const [preview, setPreview] = useState<VisitPhoto | null>(null);
    const geoCount =
        visit._photos?.filter((p) => p.latitude != null && p.longitude != null)
            .length ?? 0;
    return (
        <Card className="shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <div className="fw-bold">{visit._contractLabel}</div>
                        {showAuthor && visit._authorName && (
                            <div className="text-muted small">{visit._authorName}</div>
                        )}
                    </div>
                    <div className="text-muted small text-nowrap ms-2">
                        {fmtDate(visit.visitedAt)}
                    </div>
                </div>
                {visit.description && <div className="small mt-1">{visit.description}</div>}
                {visit._photos && visit._photos.length > 0 && (
                    <div
                        className="mt-2"
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                    >
                        {visit._photos.map((ph, i) => (
                            <div
                                key={ph.id}
                                className="position-relative"
                                role="button"
                                onClick={() => setPreview(ph)}
                                title={
                                    ph.takenAt
                                        ? `Zrobiono: ${fmtDate(ph.takenAt)}`
                                        : "Podgląd zdjęcia"
                                }
                            >
                                <img
                                    src={photoUrl(ph.gdFileId)}
                                    alt={ph.fileName ?? ""}
                                    loading="lazy"
                                    style={{
                                        width: 84,
                                        height: 84,
                                        objectFit: "cover",
                                        borderRadius: 4,
                                        display: "block",
                                    }}
                                />
                                {/* Mały numer-pinezka = ten sam numer na mapie; czerwony
                                    gdy ma GPS, szary gdy bez lokalizacji. */}
                                <span
                                    className={`position-absolute bottom-0 end-0 m-1 badge rounded-pill ${
                                        ph.latitude != null ? "bg-danger" : "bg-secondary"
                                    }`}
                                    style={{ fontSize: "0.7rem" }}
                                >
                                    {i + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-2 d-flex align-items-center gap-3">
                    {visit._gdFolderUrl && (
                        <GDFolderIconLink layout="horizontal" folderUrl={visit._gdFolderUrl} />
                    )}
                    {geoCount > 0 && (
                        <MapIconButton layout="horizontal" onClick={() => setShowMap(true)} />
                    )}
                </div>
                {showMap && (
                    <VisitMap photos={visit._photos ?? []} onClose={() => setShowMap(false)} />
                )}
                {preview && (
                    <Modal show onHide={() => setPreview(null)} centered size="lg">
                        <Modal.Body className="p-0 bg-dark text-center">
                            <img
                                src={photoUrl(preview.gdFileId)}
                                alt={preview.fileName ?? ""}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "85vh",
                                    objectFit: "contain",
                                }}
                            />
                        </Modal.Body>
                    </Modal>
                )}
            </Card.Body>
        </Card>
    );
}

// Pasek filtrów - te same prymitywy co inne FilterBody w projekcie (Form.Group/Col
// + Form.Control type text/date), bez osobnego widgetu.
function FiltersBar({
    value,
    onChange,
}: {
    value: Filters;
    onChange: (f: Filters) => void;
}) {
    const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });
    return (
        <Row className="g-2 mb-3 align-items-end">
            <Form.Group as={Col} xs={12} md>
                <Form.Label className="mb-0 small">Szukana fraza</Form.Label>
                <Form.Control
                    size="sm"
                    placeholder="Opis / kontrakt"
                    value={value.text}
                    onChange={(e) => set({ text: e.target.value })}
                />
            </Form.Group>
            <Form.Group as={Col} xs={6} md="auto">
                <Form.Label className="mb-0 small">Od</Form.Label>
                <Form.Control
                    type="date"
                    size="sm"
                    value={value.dateFrom}
                    onChange={(e) => set({ dateFrom: e.target.value })}
                />
            </Form.Group>
            <Form.Group as={Col} xs={6} md="auto">
                <Form.Label className="mb-0 small">Do</Form.Label>
                <Form.Control
                    type="date"
                    size="sm"
                    value={value.dateTo}
                    onChange={(e) => set({ dateTo: e.target.value })}
                />
            </Form.Group>
            <Col xs="auto">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => onChange(EMPTY_FILTERS)}
                >
                    Wyczyść
                </Button>
            </Col>
        </Row>
    );
}

// ----------------------------------------------------------------------------
// Lista moich wizyt (z filtrami)
// ----------------------------------------------------------------------------
function VisitsList() {
    const navigate = useNavigate();
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState<Filters>(defaultDateFilters);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetch(api("site-visits/access"), { credentials: "include" })
            .then((r) => (r.ok ? r.json() : { isAdmin: false }))
            .then((d) => setIsAdmin(!!d.isAdmin))
            .catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch(api(`site-visits${qs(filters)}`), { credentials: "include" })
            .then((r) => {
                if (!r.ok) throw new Error("Nie udało się pobrać wizyt.");
                return r.json();
            })
            .then(setVisits)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [filters]);

    return (
        <Container className="py-3" style={{ maxWidth: 720 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Moje wizyty</h4>
                <div className="d-flex gap-2">
                    {isAdmin && (
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate("/visits/admin")}
                        >
                            Przegląd
                        </Button>
                    )}
                    <Button variant="success" size="sm" onClick={() => navigate("/visits")}>
                        <FontAwesomeIcon icon={faCamera} className="me-1" />
                        Nowa wizyta
                    </Button>
                </div>
            </div>

            <FiltersBar value={filters} onChange={setFilters} />
            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner />
                </div>
            ) : visits.length === 0 ? (
                <Alert variant="info">Brak wizyt dla wybranych filtrów.</Alert>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {visits.map((v) => (
                        <VisitCard key={v.id} visit={v} />
                    ))}
                </div>
            )}
        </Container>
    );
}

// ----------------------------------------------------------------------------
// Przegląd wizyt dla ról 1/2 (grupowanie po osobie/kontrakcie + drill-down)
// ----------------------------------------------------------------------------
function ymd(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
// Widoki startują z ostatnich 30 dni (od 30 dni wstecz do dziś).
function defaultDateFilters(): Filters {
    return {
        dateFrom: ymd(ToolsDate.addDays(new Date(), -30)),
        dateTo: ymd(new Date()),
        text: "",
    };
}

function VisitsAdmin() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [groupBy, setGroupBy] = useState<"person" | "contract">("person");
    const [filters, setFilters] = useState<Filters>(defaultDateFilters);
    const [summary, setSummary] = useState<
        { groupKey: number; label: string; count: number }[]
    >([]);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [denied, setDenied] = useState(false);

    // Zaznaczona grupa trzymana w URL (?person= / ?contract=) - dzięki temu
    // systemowe/przeglądarkowe "wstecz" wraca do listy grup, bez własnej strzałki.
    const selectedGroupBy = searchParams.get("contract")
        ? "contract"
        : searchParams.get("person")
        ? "person"
        : null;
    const selectedKey = selectedGroupBy
        ? Number(searchParams.get(selectedGroupBy))
        : null;

    useEffect(() => {
        setLoading(true);
        fetch(api(`site-visits/admin/summary${qs({ groupBy, ...filters })}`), {
            credentials: "include",
        })
            .then((r) => {
                if (r.status === 401 || r.status === 403) {
                    setDenied(true);
                    return [];
                }
                if (!r.ok) throw new Error("Nie udało się pobrać podsumowania.");
                return r.json();
            })
            .then(setSummary)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [groupBy, filters]);

    useEffect(() => {
        if (selectedKey == null || !selectedGroupBy) return;
        setLoading(true);
        const key =
            selectedGroupBy === "person"
                ? { personId: selectedKey }
                : { contractId: selectedKey };
        fetch(api(`site-visits/admin${qs({ ...key, ...filters })}`), {
            credentials: "include",
        })
            .then((r) => {
                if (!r.ok) throw new Error("Nie udało się pobrać wizyt.");
                return r.json();
            })
            .then(setVisits)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [selectedKey, selectedGroupBy, filters]);

    function chooseGroupBy(g: "person" | "contract") {
        setSearchParams({}); // zmiana grupowania wychodzi z drill-downu
        setGroupBy(g);
    }

    if (denied)
        return (
            <Container className="py-3" style={{ maxWidth: 720 }}>
                <Alert variant="danger">Brak uprawnień do przeglądu wizyt.</Alert>
            </Container>
        );

    return (
        <Container className="py-3" style={{ maxWidth: 720 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Przegląd wizyt</h4>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/visits/list")}
                >
                    Moje wizyty
                </Button>
            </div>

            <ButtonGroup className="mb-3 w-100">
                <Button
                    variant={groupBy === "person" ? "primary" : "outline-primary"}
                    onClick={() => chooseGroupBy("person")}
                >
                    Wg osób
                </Button>
                <Button
                    variant={groupBy === "contract" ? "primary" : "outline-primary"}
                    onClick={() => chooseGroupBy("contract")}
                >
                    Wg kontraktów
                </Button>
            </ButtonGroup>

            <FiltersBar value={filters} onChange={setFilters} />
            {error && <Alert variant="danger">{error}</Alert>}

            {selectedKey != null ? (
                loading ? (
                    <div className="text-center py-4">
                        <Spinner />
                    </div>
                ) : visits.length === 0 ? (
                    <Alert variant="info">Brak wizyt.</Alert>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {/* Bez nagłówka grupy - autor i kontrakt są na każdej karcie. */}
                        {visits.map((v) => (
                            <VisitCard key={v.id} visit={v} showAuthor />
                        ))}
                    </div>
                )
            ) : loading ? (
                <div className="text-center py-5">
                    <Spinner />
                </div>
            ) : summary.length === 0 ? (
                <Alert variant="info">Brak wizyt dla wybranych filtrów.</Alert>
            ) : (
                <div className="d-flex flex-column gap-2">
                    {summary.map((g) => (
                        <Card
                            key={g.groupKey}
                            role="button"
                            className="shadow-sm"
                            onClick={() =>
                                setSearchParams({ [groupBy]: String(g.groupKey) })
                            }
                        >
                            <Card.Body className="d-flex justify-content-between align-items-center py-2 px-3">
                                <span className="fw-semibold">{g.label}</span>
                                <Badge bg="primary" pill>
                                    {g.count}
                                </Badge>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
}

// 'YYYY-MM-DD HH:mm:ss' z epoch ms (czas lokalny).
function nowFromEpoch(ms: number) {
    const d = new Date(ms);
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
}
