import React from "react";
import { Badge } from "react-bootstrap";

/**
 * Komórki tabel panelu administracyjnego.
 *
 * PO CO: FilterableTable renderuje `objectAttributeToShow` przez String(), więc
 * wartość logiczna wyświetliłaby się jako "true"/"false". Poza tym nagłówki kolumn
 * są wyśrodkowane (ResultSetTable), a treść komórek domyślnie nie - dlatego każdą
 * komórkę panelu wyśrodkowujemy, żeby nagłówek zgadzał się z wartością.
 */

/** Wyśrodkowanie treści komórki pod wyśrodkowanym nagłówkiem. */
export function Centered({ children }: { children: React.ReactNode }) {
    return <div className="text-center">{children}</div>;
}

/** Wartość logiczna jako czytelny znacznik. */
export function BoolCell({ value }: { value: boolean | undefined }) {
    return (
        <Centered>
            {value ? (
                <Badge bg="success">Tak</Badge>
            ) : (
                <Badge bg="light" text="dark">
                    Nie
                </Badge>
            )}
        </Centered>
    );
}

/** Próbka koloru z kodem obok - sam kod szesnastkowy nic nie mówi. */
export function ColorCell({ value }: { value: string | undefined }) {
    if (!value)
        return (
            <Centered>
                <span className="text-muted">brak</span>
            </Centered>
        );
    return (
        <Centered>
            <span className="d-inline-flex align-items-center gap-2">
                <span
                    style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        backgroundColor: value,
                        border: "1px solid rgba(0,0,0,.2)",
                        display: "inline-block",
                    }}
                />
                <span className="font-monospace small">{value}</span>
            </span>
        </Centered>
    );
}

/** Zwykły tekst, wyśrodkowany jak nagłówek. */
export function TextCell({ value }: { value: React.ReactNode }) {
    return <Centered>{value}</Centered>;
}

/** Tekst opcjonalny: brak wartości zostawia pustą komórkę, bez wypełniacza. */
export function OptionalTextCell({ value }: { value: string | null | undefined }) {
    return <Centered>{value ?? ""}</Centered>;
}
