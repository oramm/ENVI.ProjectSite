import * as Yup from "yup";
import { isValidTrackingNumber } from "./trackingNumber";
import { EntryKind, KINDS_WITH_DOCUMENT } from "./pettyCashApi";
import { toAmount } from "./previewRows";

/**
 * Walidacja wpisu do zaliczek — te same reguły, które backend sprawdza na modelu
 * domenowym przed zapisem. Tu chodzi o to, żeby błąd był widać przy polu od razu,
 * a nie dopiero po odesłaniu formularza; rozstrzyga i tak serwer.
 *
 * Kwoty są polami tekstowymi, bo w arkuszu i na klawiaturze telefonu używa się
 * przecinka. Dlatego liczby sprawdzamy testami na napisie, nie `Yup.number()`.
 */

const hasAmount = (value: unknown) => Number.isFinite(toAmount(value));
const isPositive = (value: unknown) => toAmount(value) > 0;

/** Kwota wymagana i dodatnia. */
function requiredAmount(label: string) {
    return Yup.string()
        .default("")
        .test("wypelniona", `Podaj ${label}`, (value) => Boolean(value && value.trim()))
        .test("liczba", `${label} musi być liczbą`, (value) => !value?.trim() || hasAmount(value))
        .test("dodatnia", `${label} musi być większa od zera`, (value) => !value?.trim() || isPositive(value));
}

const optionalAmount = Yup.string()
    .default("")
    .test("liczba", "To musi być liczba", (value) => !value?.trim() || hasAmount(value));

export const itemSchema = Yup.object({
    trackingNumber: Yup.string()
        .default("")
        .test("numer-nadania", "Numer nadania jest niepoprawny (18 cyfr z cyfrą kontrolną)", (value) =>
            isValidTrackingNumber(value)
        ),
    scanned: Yup.boolean().default(false),
    addressee: Yup.string().default("").required("Podaj adresata").max(500, "Za długa nazwa adresata"),
    contentsDescription: Yup.string().default(""),
    amount: requiredAmount("kwotę listu"),
});

export function makePettyCashValidationSchema() {
    return Yup.object({
        entryKind: Yup.string().default("POSTAL").required(),
        entryDate: Yup.string().default("").required("Podaj datę"),
        description: Yup.string().default("").required("Podaj opis").max(500, "Za długi opis"),
        settlementMethod: Yup.string().default("CASH").required(),
        payerLabel: Yup.string()
            .default("")
            .required("Podaj, kto zapłacił")
            .max(100, "Za długa nazwa"),
        note: Yup.string().default(""),

        // Paliwo zawsze dotyczy konkretnego auta: z niego bierze się opis wpisu, z nim
        // wiąże się wpis w kilometrówce.
        vehicleId: Yup.string()
            .default("")
            .when("entryKind", {
                is: (kind: string) => kind === "FUEL",
                then: (schema) => schema.required("Wybierz samochód"),
                otherwise: (schema) => schema.notRequired(),
            }),
        // Licznik bywa przepisywany z zegara ze spacjami, więc dopuszczamy separatory.
        odometerReading: Yup.string()
            .default("")
            .test(
                "licznik-liczba",
                "Stan licznika to sama liczba",
                (value) => !value?.trim() || /^[\d\s]+$/.test(value)
            ),

        documentNumber: Yup.string()
            .default("")
            .when("entryKind", {
                is: (kind: EntryKind) => KINDS_WITH_DOCUMENT.includes(kind),
                then: (schema) => schema.required("Podaj numer dokumentu"),
                otherwise: (schema) => schema.notRequired(),
            }),

        // Przy poczcie netto wynika z brutto (usługa zwolniona z VAT), więc pola nie ma.
        netAmount: Yup.string()
            .default("")
            .when("entryKind", {
                is: (kind: string) =>
                    kind === "INVOICE" || kind === "RECEIPT" || kind === "FUEL",
                then: () =>
                    requiredAmount("kwotę netto").test(
                        "nie-wieksze-od-brutto",
                        "Netto nie może być wyższe od brutto",
                        function (value) {
                            const gross = toAmount(this.parent.grossAmount);
                            const net = toAmount(value);
                            return !Number.isFinite(gross) || !Number.isFinite(net) || net <= gross;
                        }
                    ),
                otherwise: () => optionalAmount,
            }),

        grossAmount: Yup.string()
            .default("")
            .when("entryKind", {
                is: (kind: EntryKind) => KINDS_WITH_DOCUMENT.includes(kind),
                then: (schema) =>
                    requiredAmount("kwotę brutto").test(
                        "suma-listow",
                        "Suma listów nie zgadza się z kwotą faktury",
                        function (value) {
                            if (this.parent.entryKind !== "POSTAL") return true;
                            const items = (this.parent.items ?? []) as { amount?: string }[];
                            if (items.length === 0) return true;
                            const total = items.reduce((sum, item) => {
                                const amount = toAmount(item.amount);
                                return sum + (Number.isFinite(amount) ? amount : 0);
                            }, 0);
                            const gross = toAmount(value);
                            return !Number.isFinite(gross) || Math.abs(total - gross) < 0.005;
                        }
                    ),
                otherwise: (schema) => schema.notRequired(),
            }),

        noDocumentAmount: Yup.string()
            .default("")
            .when("entryKind", {
                is: (kind: string) => kind === "NO_DOCUMENT",
                then: () => requiredAmount("kwotę"),
                otherwise: () => optionalAmount,
            }),

        inflowAmount: Yup.string()
            .default("")
            .when("entryKind", {
                is: (kind: string) => kind === "ADVANCE",
                then: () => requiredAmount("przekazaną kwotę"),
                otherwise: () => optionalAmount,
            }),

        items: Yup.array()
            .of(itemSchema)
            .default([])
            .when("entryKind", {
                is: (kind: string) => kind === "POSTAL",
                then: (schema) => schema.min(1, "Zeskanuj albo dodaj przynajmniej jeden list"),
                otherwise: (schema) => schema.max(0),
            }),
    });
}

export type PettyCashFormValues = Yup.InferType<ReturnType<typeof makePettyCashValidationSchema>>;
