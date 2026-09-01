import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "./CyberSecurityCard.css";

/** Rady bezpieczenstwa pokazywane po jednej naraz. Tresc uzgodniona z wlascicielem:
 * rada o adresie nadawcy i o pospiechu wynika ze sprawy z podszyciem pod kontrahenta,
 * dlatego sa sformulowane bez nazywania konkretnej umowy. */
const tips: { title: string; text: React.ReactNode }[] = [
    {
        title: "Sprawdzaj pełny adres nadawcy",
        text: "Podszycie polega na tym, że nazwa firmy się zgadza, a domena różni się jedną literą albo końcówką. Rozwiń adres nadawcy i przeczytaj go w całości.",
    },
    {
        title: "Pośpiech to sygnał ostrzegawczy",
        text: "Im większa presja czasu, tym staranniej weryfikuj. Oszust liczy na to, że nie zdążysz sprawdzić.",
    },
    {
        title: "Na podejrzaną wiadomość nie odpowiadaj",
        text: "Przycisk Odpowiedz wysyła list z powrotem do oszusta, bo to on ustawia adres zwrotny. Napisz nową wiadomość na adres, który masz w kontaktach, albo po prostu zadzwoń.",
    },
    {
        title: "Pocztę otwieraj tylko pod właściwym adresem",
        text: (
            <>
                Poprawne adresy to{" "}
                <a href="https://envi.com.pl/webmail" target="_blank" rel="noreferrer">
                    envi.com.pl/webmail
                </a>{" "}
                oraz{" "}
                <a href="https://envi.com.pl/roundcube" target="_blank" rel="noreferrer">
                    envi.com.pl/roundcube
                </a>
                . Można też korzystać z klienta pocztowego, na przykład Outlooka.
            </>
        ),
    },
    {
        title: "Strona roundcube.pl to nie nasza poczta",
        text: (
            <>
                <span className="fw-semibold text-danger">Nigdy się tam nie loguj.</span> Wpisane tam hasło trafia w
                cudze ręce. Jeżeli logowałeś się tam wcześniej, zmień hasło do poczty od razu.
            </>
        ),
    },
];

/** Minimalna wysokosc obszaru tresci. Dobrana pod najdluzsza rade, zeby przelaczanie
 * rad nie zmienialo wysokosci kafelka. */
const TIP_AREA_MIN_HEIGHT = 140;

export default function CyberSecurityCard({ className, style }: { className?: string; style?: React.CSSProperties }) {
    /** Kierunek wjazdu nowej rady: 1 to wejscie z prawej (rada nastepna),
     * -1 to wejscie z lewej (rada poprzednia). */
    const [{ index, direction }, setPosition] = useState(() => ({
        index: Math.floor(Math.random() * tips.length),
        direction: 1,
    }));
    const tip = tips[index];

    const move = (step: number) =>
        setPosition((current) => ({
            index: (current.index + step + tips.length) % tips.length,
            direction: step > 0 ? 1 : -1,
        }));

    const goTo = (target: number) =>
        setPosition((current) => ({ index: target, direction: target > current.index ? 1 : -1 }));

    return (
        <Card className={className} style={style}>
            <Card.Body>
                <Card.Title className="mb-2" style={{ fontWeight: 600, fontSize: 18 }}>
                    Cyberbezpieczeństwo ENVI
                </Card.Title>
                <div
                    className="d-flex flex-column justify-content-center text-center"
                    style={{ minHeight: TIP_AREA_MIN_HEIGHT }}
                >
                    {/* key przeladowuje wezel przy zmianie rady, dzieki temu animacja rusza od nowa */}
                    <div
                        key={index}
                        className={`cyber-security-tip ${direction > 0 ? "from-right" : "from-left"}`}
                    >
                        <div className="fw-semibold small mb-1">{tip.title}</div>
                        <div className="text-secondary small">{tip.text}</div>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <button type="button" className="cyber-security-nav" onClick={() => move(-1)} aria-label="Poprzednia rada">
                        <FontAwesomeIcon icon={faChevronLeft} size="sm" />
                    </button>
                    <div className="d-flex align-items-center" style={{ gap: 6 }}>
                        {tips.map((item, itemIndex) => (
                            <button
                                key={item.title}
                                type="button"
                                className={`cyber-security-dot${itemIndex === index ? " active" : ""}`}
                                onClick={() => goTo(itemIndex)}
                                aria-label={`Rada ${itemIndex + 1}`}
                                aria-current={itemIndex === index}
                            />
                        ))}
                    </div>
                    <button type="button" className="cyber-security-nav" onClick={() => move(1)} aria-label="Następna rada">
                        <FontAwesomeIcon icon={faChevronRight} size="sm" />
                    </button>
                </div>
            </Card.Body>
        </Card>
    );
}
