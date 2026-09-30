import React, { useEffect } from "react";
import { Alert, Button, Card, Container, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import MainSetup from "../React/MainSetupReact";

/**
 * Punkt wydawania instalatora firmowego Second Brain (decyzja D-7 packa SB).
 *
 * Po co ta strona istnieje: do tej pory, żeby zainstalować Second Brain, trzeba było już mieć
 * dostęp do firmowego Dysku - czyli do tego samego, który instalator dopiero konfiguruje.
 * PS ENVI jest systemem, który nowa osoba ma pierwszego dnia, więc paczka wychodzi stąd.
 *
 * Pobranie to **zwykły odnośnik**, a nie fetch z obsługą błędu: trasa serwera odpowiada
 * `Content-Disposition: attachment`, więc przeglądarka zapisuje plik sama, a osoba bez sesji
 * dostaje z serwera odmowę zamiast pliku. Własnej autoryzacji tu nie ma i nie ma jej mieć.
 */
const PACKAGE_URL = `${MainSetup.serverUrl}sbInstaller/paczka`;

export default function SbInstallerPage() {
    useEffect(() => {
        document.title = "SB.ENVI - instalator";
    }, []);
    
    return (
        <Container className="py-4" style={{ maxWidth: 760 }}>
            <h4>Second Brain ENVI - instalator</h4>
            <p className="text-muted">
                Second Brain to wspólna baza wiedzy firmy. Na Twoim komputerze widać ją jako zwykły folder
                z notatkami, który sam odświeża się w tle. Instalacja to około 15 minut i jeden plik -
                nie musisz znać się na niczym technicznym.
            </p>

            <Card className="mb-4">
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                        <Card.Title className="mb-1">Instalator</Card.Title>
                        <Card.Text className="text-muted mb-0">
                            Pobierzesz plik ZIP. Nie musisz go rozpakowywać: otwórz go (Eksplorator pokaże
                            go jak folder) i kliknij dwukrotnie jedyny plik w środku,{" "}
                            <code>ENVI-SB-instalator.cmd</code>.
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
                    <strong>Konto GitHub.</strong> Jeśli go nie masz - załóż zwykłe, prywatne konto.
                    Następnie wyślij swoją nazwę użytkownika do biura ENVI i przyjmij zaproszenie do
                    zespołu <code>envi-konsulting</code>, które przyjdzie do Ciebie mailem od GitHuba.
                    Bez tego instalator nie pobierze wiedzy firmowej.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Dysk Google.</strong> Zaloguj się na komputerze firmowym kontem ENVI. Instalator
                    bierze stamtąd narzędzia dla agenta.
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Trenowanie AI na koncie GitHub.</strong> W ustawieniach swojego konta (Copilot)
                    wyłącz zgodę na wykorzystywanie Twojej aktywności do trenowania modeli. Treści firmowe
                    nie mają trafiać do zewnętrznych dostawców.
                </ListGroup.Item>
            </ListGroup>

            <Alert variant="light" className="border">
                Instalator można uruchamiać wielokrotnie - jeśli przerwiesz go w połowie albo któryś krok
                wyżej zrobisz później, po prostu odpal go jeszcze raz. Nic nie nadpisze i nic nie zepsuje.
                Gdyby coś wyglądało na zawieszone, zwykle brakuje jednego z dwóch kroków powyżej:
                zaproszenia na GitHubie albo zalogowania do Dysku Google.
            </Alert>

            <Alert variant="light" className="border">
                Jeśli poprosimy Cię o zapis przebiegu instalacji: to plik <code>bootstrap.log</code> w
                folderze <code>%USERPROFILE%\.envi\instalator</code> (wklej tę ścieżkę w pasek adresu
                Eksploratora). Instalator podaje pełną ścieżkę na końcu każdego przebiegu.
            </Alert>
        </Container>
    );
}
