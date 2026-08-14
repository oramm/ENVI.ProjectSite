import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { useFieldArray, useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import PostalDispatchSection, { DispatchItemDraft } from "./PostalDispatchSection";
import { normalizeTrackingNumber } from "./trackingNumber";
import { makePettyCashValidationSchema } from "./PettyCashValidationSchema";
import type { CashField, ItemField } from "./previewRows";
import { lastUsed, recall, remember, RECENT_KEYS } from "./recentValues";
import SheetPreview from "./SheetPreview";
import MainSetup from "../../React/MainSetupReact";
import {
    CommitResult,
    EntryKind,
    fetchSheetLinks,
    PettyCashApiError,
    PettyCashEntryPayload,
    SettlementMethod,
    ReceiptSuggestion,
    SheetLinks,
    submitEntry,
    wroteAnything,
} from "./pettyCashApi";
import DocumentScanPanel from "./DocumentScanPanel";

const KIND_LABELS: Record<EntryKind, string> = {
    POSTAL: "poczta — listy",
    INVOICE: "zakup z fakturą",
    RECEIPT: "paragon",
    NO_DOCUMENT: "wydatek bez dokumentu",
    ADVANCE: "wypłata zaliczki",
};

/** Opis, który wysyłki pocztowe mają w arkuszu od zawsze — podpowiadamy go zamiast kazać pisać. */
const POSTAL_DESCRIPTION = "poczta - listy";

const FORM_WIDTH = 640;

/**
 * Odnośnik do arkusza jako przycisk. Adres pochodzi z konfiguracji serwera, więc dopóki
 * nie wróci, przycisk jest nieaktywny zamiast prowadzić donikąd.
 */
function SheetButton({ url, label }: { url: string | null | undefined; label: string }) {
    return (
        <Button
            variant="outline-secondary"
            size="sm"
            href={url ?? undefined}
            target="_blank"
            rel="noreferrer"
            disabled={!url}
            title={url ? "Otwiera arkusz w nowej karcie" : "Adres arkusza nie jest skonfigurowany"}
        >
            <FontAwesomeIcon icon={faUpRightFromSquare} className="me-2" />
            {label}
        </Button>
    );
}
const today = () => new Date().toISOString().slice(0, 10);

type FormValues = {
    entryKind: EntryKind;
    entryDate: string;
    description: string;
    settlementMethod: SettlementMethod;
    payerLabel: string;
    note: string;
    documentNumber: string;
    netAmount: string;
    grossAmount: string;
    noDocumentAmount: string;
    inflowAmount: string;
    items: DispatchItemDraft[];
};

/**
 * Skrót osoby w zapisie używanym w arkuszu: pierwsza litera imienia i trzy pierwsze
 * litery nazwiska, wielkimi literami — `Anna Dorosińska` → `ADOR`.
 */
export function personShortcut(fullName: string): string {
    const [first = "", second = ""] = fullName.trim().split(/\s+/);
    return (first.slice(0, 1) + second.slice(0, 3)).toUpperCase();
}

/**
 * Domyślnie płaci ten, kto wpisuje. Ostatnio użyta wartość ma pierwszeństwo, bo bywa,
 * że wpisuje się za kogoś.
 */
function defaultPayer(): string {
    const remembered = lastUsed(RECENT_KEYS.payer);
    if (remembered) return remembered;
    try {
        return personShortcut(MainSetup.currentUserOrNull?.userName ?? "");
    } catch {
        return "";
    }
}

/**
 * Formularz wpisu do zaliczek.
 *
 * Walidacja jak w pozostałych formularzach aplikacji: `react-hook-form` z resolverem
 * `yup`, komunikat pod polem, przycisk zablokowany dopóki formularz nie jest poprawny.
 * Reguły są odbiciem tych, które backend sprawdza na modelu domenowym — tu chodzi
 * o szybką informację zwrotną, rozstrzyga i tak serwer.
 *
 * Pola idą w jednej kolumnie, bo wpisy powstają na telefonie. Tabela pod spodem pokazuje
 * to samo w układzie arkusza i też pozwala pisać — obie powierzchnie czytają ten sam stan.
 */
export default function PettyCashEntryPage() {
    const schema = useMemo(() => makePettyCashValidationSchema(), []);
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        mode: "onChange",
        resolver: yupResolver(schema) as any,
        defaultValues: {
            entryKind: "POSTAL",
            entryDate: today(),
            description: POSTAL_DESCRIPTION,
            settlementMethod: "CASH",
            payerLabel: defaultPayer(),
            note: "",
            documentNumber: "",
            netAmount: "",
            grossAmount: "",
            noDocumentAmount: "",
            inflowAmount: "",
            items: [],
        },
    });
    const { replace } = useFieldArray({ control, name: "items" });

    const [busy, setBusy] = useState(false);
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const [result, setResult] = useState<CommitResult | null>(null);
    const [links, setLinks] = useState<SheetLinks | null>(null);

    useEffect(() => {
        fetchSheetLinks()
            .then(setLinks)
            .catch(() => setLinks(null));
    }, []);

    const values = watch();
    const kind = values.entryKind;
    const isPostal = kind === "POSTAL";
    const isAdvance = kind === "ADVANCE";
    const hasDocumentAmounts = isPostal || kind === "INVOICE" || kind === "RECEIPT";
    const recentPayers = recall(RECENT_KEYS.payer);

    const changeKind = (next: EntryKind) => {
        setValue("entryKind", next, { shouldValidate: true });
        setValue("settlementMethod", next === "ADVANCE" ? "ADVANCE" : "CASH", {
            shouldValidate: true,
        });
        // Podpowiedziany opis chodzi za rodzajem w obie strony. Zabieramy go tylko wtedy, gdy
        // to nadal nasz tekst — tego, co ktoś wpisał sam, zmiana rodzaju nie kasuje.
        const description = values.description.trim();
        if (next === "POSTAL" && !description)
            setValue("description", POSTAL_DESCRIPTION, { shouldValidate: true });
        if (next !== "POSTAL" && description === POSTAL_DESCRIPTION)
            setValue("description", "", { shouldValidate: true });
        if (next !== "POSTAL") replace([]);
        setResult(null);
        setServerErrors([]);
    };

    /**
     * Podpowiedzi z odczytanego dokumentu. Wypełniamy tylko to, co model faktycznie znalazł —
     * brak wartości zostaje pustym polem, bo puste rzuca się w oczy bardziej niż liczba
     * wzięta z sufitu. Kwoty zapisujemy z przecinkiem, tak jak wpisuje je człowiek i arkusz.
     */
    const applySuggestion = (suggestion: ReceiptSuggestion) => {
        const amount = (value: number | null) =>
            value === null ? null : value.toFixed(2).replace(".", ",");

        const patch: Array<[CashField, string | null]> = [
            ["documentNumber", suggestion.documentNumber],
            ["grossAmount", amount(suggestion.grossAmount)],
            ["netAmount", amount(suggestion.netAmount)],
        ];
        patch.forEach(([fieldName, value]) => {
            if (value !== null) setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
        });
    };

    /** Tabela edytuje ten sam stan co pola wyżej — jedno źródło prawdy, dwie powierzchnie. */
    const setCashField = (field: CashField, value: string) =>
        setValue(field, value, { shouldValidate: true, shouldDirty: true });

    const setItemField = (index: number, field: ItemField, value: string) => {
        setValue(
            `items.${index}.${field}` as const,
            field === "trackingNumber" ? (normalizeTrackingNumber(value) ?? value) : value,
            { shouldValidate: true, shouldDirty: true }
        );
        // Numer poprawiony ręcznie przestaje być „ze skanu”, więc zostaje edytowalny.
        if (field === "trackingNumber")
            setValue(`items.${index}.scanned` as const, false, { shouldDirty: true });
    };

    const buildPayload = (form: FormValues): PettyCashEntryPayload => {
        const gross = hasDocumentAmounts ? form.grossAmount : null;
        const expense =
            kind === "NO_DOCUMENT" ? form.noDocumentAmount : isAdvance ? "0" : form.grossAmount;
        return {
            entryKind: form.entryKind,
            entryDate: form.entryDate,
            description: form.description.trim(),
            // Usługi pocztowe są zwolnione z VAT, więc netto zawsze równa się brutto.
            netAmount: isPostal ? gross : hasDocumentAmounts ? form.netAmount || gross : null,
            grossAmount: gross,
            noDocumentAmount: kind === "NO_DOCUMENT" ? form.noDocumentAmount : null,
            // Przy karcie kolumna wpływu jest lustrem wydatku — liczymy ją, nie pytamy.
            inflowAmount: isAdvance
                ? form.inflowAmount
                : form.settlementMethod === "CARD"
                  ? expense
                  : null,
            documentNumber: form.documentNumber.trim() || null,
            payerLabel: form.payerLabel.trim(),
            settlementMethod: form.settlementMethod,
            note: form.note.trim() || null,
            dispatch: isPostal
                ? {
                      invoiceNumber: form.documentNumber.trim(),
                      items: form.items.map((item) => ({
                          trackingNumber: item.trackingNumber,
                          addressee: item.addressee.trim(),
                          contentsDescription: item.contentsDescription.trim() || null,
                          amount: item.amount,
                      })),
                  }
                : null,
        };
    };

    const onSubmit = async (form: FormValues) => {
        setBusy(true);
        setServerErrors([]);
        setResult(null);
        try {
            const commit = await submitEntry(buildPayload(form));
            setResult(commit);
            remember(RECENT_KEYS.payer, form.payerLabel);
            form.items.forEach((item) => {
                remember(RECENT_KEYS.addressee, item.addressee);
                remember(RECENT_KEYS.itemAmount, item.amount);
            });
            reset({
                ...form,
                description: form.entryKind === "POSTAL" ? POSTAL_DESCRIPTION : "",
                documentNumber: "",
                netAmount: "",
                grossAmount: "",
                noDocumentAmount: "",
                inflowAmount: "",
                note: "",
                items: [],
            });
        } catch (error) {
            const apiError = error as PettyCashApiError;
            setServerErrors(apiError.errors?.length ? apiError.errors : [apiError.message]);
        } finally {
            setBusy(false);
        }
    };

    const field = (name: keyof FormValues) => ({
        ...register(name),
        isInvalid: Boolean(errors[name]),
    });
    const feedback = (name: keyof FormValues) => (
        <Form.Control.Feedback type="invalid">
            {(errors[name] as any)?.message}
        </Form.Control.Feedback>
    );

    const saved = result !== null && wroteAnything(result);

    return (
        <Container style={{ maxWidth: 1180 }}>
            <div style={{ maxWidth: FORM_WIDTH }} className="mx-auto">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <h5 className="mb-0">Nowy wpis do zaliczek</h5>
                    <div className="d-flex gap-2">
                        <SheetButton url={links?.pettyCashUrl} label="Arkusz zaliczek" />
                        <SheetButton url={links?.registerUrl} label="Rejestr listów" />
                    </div>
                </div>

                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Form.Group className="mb-2">
                        <Form.Label className="mb-1 small text-muted">Rodzaj</Form.Label>
                        <Form.Select
                            value={kind}
                            onChange={(event) => changeKind(event.target.value as EntryKind)}
                        >
                            {Object.entries(KIND_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label className="mb-1 small text-muted">Data</Form.Label>
                        <Form.Control type="date" {...field("entryDate")} />
                        {feedback("entryDate")}
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label className="mb-1 small text-muted">Opis</Form.Label>
                        <Form.Control {...field("description")} />
                        {feedback("description")}
                    </Form.Group>

                    {hasDocumentAmounts && (
                        <>
                            <DocumentScanPanel onSuggestion={applySuggestion} />
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-1 small text-muted">
                                    {isPostal ? "Numer faktury Poczty" : "Numer dokumentu"}
                                </Form.Label>
                                <Form.Control {...field("documentNumber")} />
                                {feedback("documentNumber")}
                            </Form.Group>
                            <div className="d-flex gap-2 mb-2">
                                {!isPostal && (
                                    <Form.Group className="flex-fill">
                                        <Form.Label className="mb-1 small text-muted">Netto</Form.Label>
                                        <Form.Control inputMode="decimal" {...field("netAmount")} />
                                        {feedback("netAmount")}
                                    </Form.Group>
                                )}
                                <Form.Group className="flex-fill">
                                    <Form.Label className="mb-1 small text-muted">
                                        {isPostal ? "Kwota faktury" : "Brutto"}
                                    </Form.Label>
                                    <Form.Control inputMode="decimal" {...field("grossAmount")} />
                                    {feedback("grossAmount")}
                                </Form.Group>
                            </div>
                        </>
                    )}

                    {kind === "NO_DOCUMENT" && (
                        <Form.Group className="mb-2">
                            <Form.Label className="mb-1 small text-muted">
                                Kwota (bez dokumentu)
                            </Form.Label>
                            <Form.Control inputMode="decimal" {...field("noDocumentAmount")} />
                            {feedback("noDocumentAmount")}
                        </Form.Group>
                    )}

                    {isAdvance && (
                        <Form.Group className="mb-2">
                            <Form.Label className="mb-1 small text-muted">Przekazana kwota</Form.Label>
                            <Form.Control inputMode="decimal" {...field("inflowAmount")} />
                            {feedback("inflowAmount")}
                        </Form.Group>
                    )}

                    {!isAdvance && (
                        <Form.Group className="mb-2">
                            <Form.Label className="mb-1 small text-muted">Czym zapłacono</Form.Label>
                            <Form.Select {...register("settlementMethod")}>
                                <option value="CASH">gotówką z portfela</option>
                                <option value="CARD">kartą firmową</option>
                            </Form.Select>
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="mb-1 small text-muted">Kto zapłacił</Form.Label>
                        <Form.Control list="petty-cash-payers" {...field("payerLabel")} />
                        <datalist id="petty-cash-payers">
                            {recentPayers.map((value) => (
                                <option key={value} value={value} />
                            ))}
                        </datalist>
                        {feedback("payerLabel")}
                    </Form.Group>

                    {isPostal && (
                        <>
                            <PostalDispatchSection
                                items={values.items}

                                onChange={(next) => replace(next)}
                            />
                            {errors.items && (
                                <div className="text-danger small mb-2">
                                    {(errors.items as any)?.message ??
                                        "Popraw dane listów — szczegóły przy pozycjach."}
                                </div>
                            )}
                        </>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="mb-1 small text-muted">Uwaga (opcjonalnie)</Form.Label>
                        <Form.Control {...field("note")} />
                        {feedback("note")}
                    </Form.Group>
                </Form>
            </div>

            <SheetPreview
                input={{
                    entryKind: kind,
                    entryDate: values.entryDate,
                    description: values.description,
                    netAmount: values.netAmount,
                    grossAmount: values.grossAmount,
                    noDocumentAmount: values.noDocumentAmount,
                    inflowAmount: values.inflowAmount,
                    documentNumber: values.documentNumber,
                    payerLabel: values.payerLabel,
                    settlementMethod: values.settlementMethod,
                    note: values.note,
                }}
                items={values.items}
                onCashChange={setCashField}
                onItemChange={setItemField}
            />

            <div style={{ maxWidth: FORM_WIDTH }} className="mx-auto">
                {serverErrors.length > 0 && (
                    <Alert variant="danger" className="py-2">
                        {serverErrors.map((message, index) => (
                            <div key={index}>{message}</div>
                        ))}
                    </Alert>
                )}

                {result && (
                    <Alert variant={saved ? "success" : "warning"} className="py-2">
                        {saved ? "Zapisano." : "Pominięto — nic nie zostało dopisane."}
                        {result.register && (
                            <div className="small">
                                Rejestr listów:{" "}
                                {result.register.action === "write"
                                    ? `blok ${result.register.blockNumber}, wiersz ${result.register.headerRow}.`
                                    : result.register.reason}
                            </div>
                        )}
                        <div className="small">
                            Zaliczki:{" "}
                            {result.cash.action === "write"
                                ? `wiersz ${result.cash.targetRow}.`
                                : result.cash.reason}
                        </div>
                    </Alert>
                )}

                <div className="d-grid mb-4">
                    <Button size="lg" disabled={busy || !isValid} onClick={handleSubmit(onSubmit)}>
                        {busy ? <Spinner size="sm" animation="border" /> : "Zatwierdź"}
                    </Button>
                </div>
            </div>
        </Container>
    );
}
