import React from "react";
import { Badge, Button, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import BarcodeScanPanel from "./BarcodeScanPanel";
import { formatTrackingNumber, isValidTrackingNumber, normalizeTrackingNumber } from "./trackingNumber";
import { recall, RECENT_KEYS } from "./recentValues";

export type DispatchItemDraft = {
    trackingNumber: string;
    /** true = numer przyszedł ze skanera, więc pole jest tylko do odczytu */
    scanned: boolean;
    addressee: string;
    contentsDescription: string;
    amount: string;
};

export const emptyItem = (): DispatchItemDraft => ({
    trackingNumber: "",
    scanned: false,
    addressee: "",
    contentsDescription: "",
    amount: "",
});

/**
 * Lista listów w jednej wysyłce.
 *
 * Układ kafelkowy, nie tabela: wpisy powstają na telefonie, a pięć kolumn na ekranie
 * 375 px kończy się przewijaniem w bok. Każdy list ma własny blok z numerem nadania
 * jako podpisem.
 */
export default function PostalDispatchSection({
    items,
    onChange,
}: {
    items: DispatchItemDraft[];
    onChange: (items: DispatchItemDraft[]) => void;
}) {
    const recentAddressees = recall(RECENT_KEYS.addressee);
    const recentAmounts = recall(RECENT_KEYS.itemAmount);

    const scannedNumbers = items.map((item) => item.trackingNumber).filter(Boolean);

    const update = (index: number, patch: Partial<DispatchItemDraft>) =>
        onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

    const addScanned = (trackingNumber: string) =>
        onChange([
            ...items.filter((item) => item.trackingNumber || item.addressee || item.amount),
            { ...emptyItem(), trackingNumber, scanned: true },
        ]);

    return (
        <>
            <div className="mb-3">
                <BarcodeScanPanel knownNumbers={scannedNumbers} onScanned={addScanned} />
            </div>

            {items.map((item, index) => {
                const trackingOk = isValidTrackingNumber(item.trackingNumber);
                return (
                    <Card key={index} className="mb-2">
                        <Card.Body className="p-2">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                {item.scanned ? (
                                    <Badge bg="success-subtle" text="success-emphasis" className="font-monospace">
                                        {formatTrackingNumber(item.trackingNumber)}
                                    </Badge>
                                ) : (
                                    <Form.Control
                                        size="sm"
                                        inputMode="numeric"
                                        placeholder="numer nadania"
                                        isInvalid={item.trackingNumber.length > 0 && !trackingOk}
                                        value={item.trackingNumber}
                                        onChange={(event) =>
                                            update(index, {
                                                trackingNumber:
                                                    normalizeTrackingNumber(event.target.value) ??
                                                    event.target.value,
                                            })
                                        }
                                    />
                                )}
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-danger ms-2"
                                    aria-label={`Usuń list ${index + 1}`}
                                    onClick={() => onChange(items.filter((_, i) => i !== index))}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </div>

                            <Form.Control
                                className="mb-2"
                                placeholder="adresat"
                                list={`addressees-${index}`}
                                value={item.addressee}
                                onChange={(event) => update(index, { addressee: event.target.value })}
                            />
                            <datalist id={`addressees-${index}`}>
                                {recentAddressees.map((value) => (
                                    <option key={value} value={value} />
                                ))}
                            </datalist>

                            <Form.Control
                                className="mb-2"
                                as="textarea"
                                rows={2}
                                placeholder="co wysłano"
                                value={item.contentsDescription}
                                onChange={(event) =>
                                    update(index, { contentsDescription: event.target.value })
                                }
                            />

                            <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                    style={{ maxWidth: 120 }}
                                    inputMode="decimal"
                                    placeholder="kwota"
                                    value={item.amount}
                                    onChange={(event) => update(index, { amount: event.target.value })}
                                />
                                {recentAmounts.slice(0, 3).map((value) => (
                                    <Button
                                        key={value}
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => update(index, { amount: value })}
                                    >
                                        {value}
                                    </Button>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                );
            })}

            <Button
                variant="outline-secondary"
                size="sm"
                className="mb-3"
                onClick={() => onChange([...items, emptyItem()])}
            >
                Dodaj list ręcznie
            </Button>

        </>
    );
}
