import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Container, ListGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { SigningApi, SigningProgramInfo } from "./SigningApi";

/**
 * Strona programu ENVI Podpis - instalatora, który podpisuje pisma z PS podpisem kwalifikowanym
 * z karty. Program otwiera PS sam (przycisk „PDF z podpisem kwalifikowanym” przy piśmie), więc tu
 * jest tylko pobranie i wyjaśnienie, jak go zainstalować lub zaktualizować.
 *
 * Pobranie to **zwykły odnośnik** (jak w instalatorze Second Brain): serwer oddaje plik jako
 * załącznik, a przeglądarka zapisuje go sama.
 */
type ProgramState = { status: "loading" } | { status: "ready"; info: SigningProgramInfo } | { status: "error" };

function VersionLine({ state }: { state: ProgramState }) {
    if (state.status === "loading") {
        return (
            <Card.Text className="text-muted mb-0">
                <Spinner animation="border" size="sm" className="me-2" aria-label="Sprawdzanie wersji" />
                Sprawdzam wersję...
            </Card.Text>
        );
    }
    if (state.status === "error") {
        return <Card.Text className="text-muted mb-0">Nie udało się sprawdzić wersji programu.</Card.Text>;
    }
    if (!state.info.available) return null;
    if (!state.info.version) return null;
    return <Card.Text className="text-muted mb-0">Wersja dostępna w PS: {state.info.version}</Card.Text>;
}

export default function EnviPodpisPage() {
    const [state, setState] = useState<ProgramState>({ status: "loading" });

    useEffect(() => {
        let active = true;
        SigningApi.programInfo().then(
            info => { if (active) setState({ status: "ready", info }); },
            () => { if (active) setState({ status: "error" }); },
        );
        return () => { active = false; };
    }, []);

    const unavailable = state.status === "ready" && !state.info.available;

    return (
        <Container className="py-4" style={{ maxWidth: 760 }}>
            <h4>ENVI Podpis</h4>
            <p className="text-muted">
                ENVI Podpis to program na Twój komputer. Podpisuje pisma z PS podpisem kwalifikowanym z karty,
                więc potrzebny jest czytnik kart i Twoja karta kwalifikowana. PS otwiera program sam po kliknięciu
                ikony <em>PDF z podpisem kwalifikowanym</em> przy piśmie (nazwa pokazuje się po najechaniu myszą) - nie uruchamiasz go ręcznie.
            </p>

            <Card className="mb-4">
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                        <Card.Title className="mb-1">Program ENVI Podpis</Card.Title>
                        <VersionLine state={state} />
                        {unavailable && (
                            <Alert variant="warning" className="mt-2 mb-0">
                                Program nie jest teraz dostępny do pobrania. Zgłoś to administratorowi.
                            </Alert>
                        )}
                    </div>
                    {!unavailable && (
                        <Button href={SigningApi.programDownloadUrl()} variant="primary" size="lg">
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Pobierz ENVI Podpis
                        </Button>
                    )}
                </Card.Body>
            </Card>

            <h5>Instalacja i aktualizacja</h5>
            <ListGroup numbered className="mb-4">
                <ListGroup.Item>Pobierz plik i uruchom go.</ListGroup.Item>
                <ListGroup.Item>
                    Nowsza wersja instaluje się na starszą - nic nie trzeba odinstalowywać.
                </ListGroup.Item>
                <ListGroup.Item>
                    PS nie wie, jaką wersję masz na komputerze. Jeśli PS będzie wymagał nowszej, program sam to
                    powie przy podpisie - wtedy wróć na tę stronę i pobierz go jeszcze raz.
                </ListGroup.Item>
            </ListGroup>
        </Container>
    );
}
