import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Container, ListGroup, Spinner } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import MainSetup from "../React/MainSetupReact";
import { SpinnerBootstrap } from "../View/Resultsets/CommonComponents";
import { linkOwnGithubAccount, useSbAccess } from "./sbAccessApi";
import { describeLinkFailure, linkPanelMode, parseGithubLoginParam } from "./sbAccessView";

/**
 * Punkt wydawania instalatora firmowego Second Brain (decyzja D-7 packa SB).
 *
 * Po co ta strona istnieje: do tej pory, żeby zainstalować Second Brain, trzeba było już mieć
 * dostęp do firmowego Dysku - czyli do tego samego, który instalator dopiero konfiguruje.
 * PS ENVI jest systemem, który nowa osoba ma pierwszego dnia, więc paczka wychodzi stąd.
 *
 * Pobranie to **zwykły odnośnik**, a nie fetch z obsługą błędu: trasa serwera odpowiada
 * `Content-Disposition: attachment`, więc przeglądarka zapisuje plik sama, a osoba bez sesji
 * dostaje z serwera odmowę zamiast pliku. O dostępie decyduje rejestr SB w PS.
 */
const PACKAGE_URL = `${MainSetup.serverUrl}sbInstaller/paczka`;

/**
 * Kotwica sekcji "Po instalacji". Router jest hashowy (`#/sbInstaller`), więc drugi `#` w adresie
 * nie zadziała - instalator otwiera `/#/sbInstaller?sekcja=po-instalacji`, a strona sama przewija.
 */
const POST_INSTALL_ID = "po-instalacji";

/** Link zewnętrzny w nowej karcie - osoba ma wrócić na tę stronę, a nie jej szukać. */
function Link({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    );
}

export default function SbInstallerPage() {
    const sb = useSbAccess();
    const [searchParams] = useSearchParams();
    const login = parseGithubLoginParam(searchParams.get("githubLogin"));
    const [linking, setLinking] = useState(false);
    const [linkResult, setLinkResult] = useState<{
        login: string; success: boolean; message: string; note: string;
    } | null>(null);
    const systemEmail = MainSetup.currentUserOrNull?.systemEmail?.trim();
    const loginAddress = systemEmail ? <strong>{systemEmail}</strong> : "adres, którym logujesz się do PS";

    const scrollToSection = searchParams.get("sekcja");

    useEffect(() => {
        document.title = "SB.ENVI - instalator";
    }, []);

    // Sekcja pojawia się dopiero po sprawdzeniu dostępu, dlatego przewijamy po zmianie stanu.
    useEffect(() => {
        if (sb.state !== "granted" || scrollToSection !== POST_INSTALL_ID) return;
        document.getElementById(POST_INSTALL_ID)?.scrollIntoView?.();
    }, [sb.state, scrollToSection]);

    async function linkAccount() {
        if (!login || linking) return;
        setLinking(true);
        setLinkResult(null);
        const result = await linkOwnGithubAccount(login);
        setLinking(false);
        if (result.ok) {
            setLinkResult({ login, success: true, message: `Gotowe - konto GitHub ${login} jest powiązane z Twoim dostępem.`, note: result.result === "PARTIAL" ? result.note : "" });
            sb.reload();
        } else {
            setLinkResult({ login, success: false, message: describeLinkFailure(result.status, result.message), note: "" });
        }
    }

    if (sb.state === "loading") return <SpinnerBootstrap />;
    if (sb.state === "error") return <Container className="py-4"><Alert variant="danger">Nie udało się sprawdzić dostępu do Second Brain. Odśwież stronę.</Alert></Container>;
    if (sb.state === "denied" || !sb.access?.sb) return (
        <Container className="py-4" style={{ maxWidth: 760 }}>
            <h4>Second Brain ENVI</h4>
            <Alert variant="info">Nie masz jeszcze dostępu do Second Brain - poproś przełożonego o zaproszenie do SB w PS.</Alert>
        </Container>
    );

    const access = sb.access.sb;
    const panelMode = linkPanelMode(access, login);
    const result = linkResult?.login === login ? linkResult : null;

    return (
        <Container className="py-4" style={{ maxWidth: 760 }}>
            <h4>Second Brain ENVI - instalator</h4>
            <p className="text-muted">
                Second Brain to wspólna baza wiedzy firmy. Na Twoim komputerze widać ją jako zwykły folder
                z notatkami, który sam odświeża się w tle. Instalacja to około 15 minut i jeden plik -
                nie musisz znać się na niczym technicznym.
            </p>

            <Card className="mb-4">
                <Card.Body><Card.Title>Twój dostęp</Card.Title></Card.Body>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <strong className="me-2">GitHub</strong>
                        {access.isGrantedManually ? <Badge bg="success">Aktywny (nadany ręcznie)</Badge> : (
                            access.githubState === "PENDING" ? <>
                                <Badge bg="warning" text="dark">Zaproszenie czeka na przyjęcie</Badge>
                                <div className="text-muted mt-1">Sprawdź pocztę (adres logowania do PS) i kliknij Join, potem Continue with Google.</div>
                            </> : access.githubState === "LINKED" ? <>
                                <Badge bg="success">Aktywny</Badge>
                                <div className="text-muted mt-1">Konto: {access.githubLogin}</div>
                            </> : <>
                                <Badge bg="secondary">Aktywny, konto niepowiązane</Badge>
                                <div className="text-muted mt-1">Konto GitHub powiąże się po pierwszym uruchomieniu instalatora.</div>
                            </>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong className="me-2">Dysk Google</strong>
                        {access.driveState === "READY" ? <Badge bg="success">Gotowy</Badge> : <>
                            <Badge bg="danger">Brak dostępu do Dysku</Badge>
                            <div className="text-muted mt-1">Poproś przełożonego o sprawdzenie dostępu do SB w PS.</div>
                        </>}
                    </ListGroup.Item>
                </ListGroup>
            </Card>

            {result && <Alert variant={result.success ? "success" : "danger"}>{result.message}</Alert>}
            {result?.note && <Alert variant="warning">{result.note}</Alert>}
            {panelMode === "ask" && !result?.success && <Alert variant="light" className="border">
                <p>Instalator wykrył na tym komputerze konto GitHub: <strong>{login}</strong>. Czy to Twoje konto?</p>
                <Button variant="primary" disabled={linking} onClick={linkAccount}>
                    {linking && <Spinner animation="border" size="sm" className="me-2" aria-label="Trwa powiązanie konta" />}
                    To moje konto
                </Button>
            </Alert>}
            {panelMode === "already" && !result?.success && <Alert variant="success">
                Konto GitHub {login} jest już powiązane z Twoim dostępem.
            </Alert>}
            {panelMode === "other" && <Alert variant="warning">
                Masz już powiązane konto GitHub {access.githubLogin}, a instalator wykrył {login}. Zmianę konta zleć przełożonemu.
            </Alert>}

            <Card className="mb-4">
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                        <Card.Title className="mb-1">Instalator</Card.Title>
                        <Card.Text className="text-muted mb-0">
                            Pobierzesz plik ZIP. Kliknij go prawym przyciskiem myszy, wybierz{" "}
                            <em>Wyodrębnij wszystkie</em>, a potem w wypakowanym folderze kliknij dwukrotnie{" "}
                            <code>ENVI-SB-instalator.cmd</code>. Nie uruchamiaj go z wnętrza ZIP-a.
                        </Card.Text>
                    </div>
                    <Button href={PACKAGE_URL} variant="primary" size="lg">
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Pobierz instalator
                    </Button>
                </Card.Body>
            </Card>

            <h5>Zanim uruchomisz instalator</h5>
            <ListGroup numbered className="mb-4">
                <ListGroup.Item>
                    <strong>Konto GitHub.</strong> Nie zakładasz konta i nie musisz nic wysyłać do biura.
                    Zaproszenie do organizacji <code>envi-konsulting</code> przyjdzie mailem na {loginAddress}.
                    W mailu kliknij "Join", a potem "Continue with Google" - tym samym kontem Google,
                    którym logujesz się do PS. Jeśli maila nie widzisz, możesz zaproszenie przyjąć też tu:{" "}
                    <Link href="https://github.com/orgs/envi-konsulting/invitation">
                        przyjmij zaproszenie
                    </Link>{" "}
                    (link zadziała, gdy zaproszenie już jest wysłane). Bez tego instalator nie pobierze wiedzy firmowej.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Dysk Google.</strong> Zaloguj się tym samym kontem{systemEmail ? <>: {loginAddress}</> : ", którym logujesz się do PS"} (zwykle już jesteś).
                    Sprawdzisz to,{" "}
                    <Link href="https://drive.google.com/drive/shared-drives">otwierając Dysk Google</Link>: po
                    kliknięciu w swoje zdjęcie w prawym górnym rogu powinien być ten adres. Instalator bierze
                    stamtąd narzędzia dla agenta.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Trenowanie AI na koncie GitHub.</strong> Po przyjęciu zaproszenia otwórz{" "}
                    <Link href="https://github.com/settings/copilot/features">ustawienia Copilot</Link>, na samym
                    dole w sekcji <em>Privacy</em> przy <em>Allow GitHub to use my data for AI model training</em>{" "}
                    wybierz <em>Disabled</em> (zapisuje się samo). Treści firmowe nie mają trafiać do
                    zewnętrznych dostawców.
                </ListGroup.Item>
            </ListGroup>

            <h5>W trakcie instalacji</h5>
            <p className="text-muted">
                W trakcie instalacji pojawią się okna, o których warto wiedzieć wcześniej. Żadne z nich
                nie oznacza błędu.
            </p>
            <ListGroup numbered className="mb-4">
                <ListGroup.Item>
                    <strong>Okna Windows "Czy zezwolić tej aplikacji na wprowadzanie zmian?"</strong> pojawią się
                    przy instalacji GitHuba, Dysku Google i Node.js. Za każdym razem wybierz <em>Tak</em>.
                    Podobne okno może się pojawić przy innych programach instalowanych przez instalator SB
                    - to on, kliknij <em>Tak</em>.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Logowanie do Dysku Google.</strong> Google może ostrzec o Google Play. Wybierz{" "}
                    <em>Zaloguj się</em>.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Jednorazowy ekran Google "Google nie zweryfikował tej aplikacji".</strong> To nasza
                    aplikacja. Kliknij <em>Zaawansowane</em>, a potem <em>Przejdź do ENVI Second Brain</em>.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Logowanie do GitHuba.</strong> Instalator pokaże kod. Kod jest ważny 15 minut, więc
                    nie przerywaj w tym czasie. Jeśli kod zniknął ze schowka, przepisz go z okna instalatora.
                    GitHub może poprosić o potwierdzenie kodem z maila (<em>Confirm access</em> albo{" "}
                    <em>Verify via email</em>) - sprawdź pocztę na adres logowania do PS.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Okno antywirusa przy zakładaniu zadania w harmonogramie</strong> (na przykład "Wykryto
                    podejrzany proces"). To instalator Second Brain, który ustawia regularne pobieranie wiedzy.
                    Wybierz <em>Wznów</em> albo <em>Zezwól</em>.
                </ListGroup.Item>
            </ListGroup>

            <Alert variant="light" className="border">
                Konto GitHub zakładasz przez <em>Continue with Google</em>. Jeśli na stronie logowania nie ma
                przycisku Google, wejdź przez{" "}
                <Link href="https://github.com/signup">github.com/signup</Link> i tam wybierz{" "}
                <em>Continue with Google</em>. Komunikat <em>Too many requests</em> mija sam po kilku minutach -
                poczekaj i spróbuj ponownie.
            </Alert>

            <Alert variant="light" className="border">
                Instalator można uruchamiać wielokrotnie - jeśli przerwiesz go w połowie albo któryś krok
                wyżej zrobisz później, po prostu odpal go jeszcze raz. Nic nie nadpisze i nic nie zepsuje.
                Gdyby coś wyglądało na zawieszone, zwykle brakuje przyjętego zaproszenia na GitHubie
                (sprawdź pocztę na adres logowania do PS) albo jesteś zalogowany do Dysku Google innym
                kontem niż to z PS.
            </Alert>

            <Alert variant="light" className="border">
                Jeśli poprosimy Cię o zapis przebiegu instalacji: to plik <code>bootstrap.log</code> w
                folderze <code>%USERPROFILE%\.envi\instalator</code> (wklej tę ścieżkę w pasek adresu
                Eksploratora). Instalator podaje pełną ścieżkę na końcu każdego przebiegu.
            </Alert>

            <h5 id={POST_INSTALL_ID} className="mt-4">Po instalacji - co dalej</h5>
            <ListGroup numbered className="mb-4">
                <ListGroup.Item>
                    <strong>Claude.</strong> Instalator stawia aplikację Claude sam. Uruchom ją z menu Start,
                    przejdź do zakładki <em>Code</em> i wskaż folder <code>ENVI-Kanon</code> (w Twoim folderze
                    użytkownika). Kto woli terminal: w tym folderze wpisz <code>claude</code>.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Codex.</strong> Instalator stawia też aplikację Codex (w menu Start może się nazywać
                    ChatGPT). Uruchom ją i wskaż ten sam folder <code>ENVI-Kanon</code>. W terminalu:{" "}
                    <code>codex</code>.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Pierwsze logowanie.</strong> Obie aplikacje poproszą o zalogowanie. Claude i Codex
                    wymagają płatnego konta; z którego konta korzystać, wskaże przełożony.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Umiejętności (skille).</strong> Są już na miejscu, nic nie instalujesz.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Dysk i Dokumenty Google.</strong> Działają po jednorazowym logowaniu do Google,
                    które instalator prowadzi w trakcie przebiegu.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Aktualizacje.</strong> Gdy przy zegarze pojawi się dymek „Second Brain: jest nowa
                    wersja", kliknij go albo wybierz w menu Start <em>Aktualizuj Second Brain</em>. ZIP-a nie
                    pobierasz drugi raz. Aktualizacja odświeża też Pythona, Node.js, Git oraz Claude i Codex w
                    terminalu, a aplikacje Claude i Codex aktualizują się same. Nic nie nadpisze i nic nie zepsuje.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Gdy coś się nie udało.</strong> Wyślij plik <code>bootstrap.log</code> z folderu{" "}
                    <code>%USERPROFILE%\.envi\instalator</code> (wklej tę ścieżkę w pasek adresu Eksploratora).
                </ListGroup.Item>
            </ListGroup>
        </Container>
    );
}
