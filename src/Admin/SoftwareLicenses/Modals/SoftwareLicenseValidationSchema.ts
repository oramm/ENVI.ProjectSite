import * as Yup from "yup";

export const licenseTextFields = [
    ["manufacturer", "Producent", 255], ["product", "Produkt", 255],
    ["version", "Wersja", 100], ["registrationAccount", "Konto rejestracji", 320],
    ["vendorPanelUrl", "Panel producenta", 65535], ["assignment", "Przypisanie", 65535],
    ["billingCycle", "Cykl rozliczeniowy", 100], ["status", "Status", 100],
    ["comment", "Uwagi", 65535],
] as const;

const validUnicode = (value: string) => !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value);
const byteLength = (value: string) => new TextEncoder().encode(value).length;
const date = () => Yup.string().test("date", "Podaj prawidłową datę (rok od 1000 do 9999)", value => {
    if (!value) return true;
    if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + "T00:00:00Z");
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const seats = () => Yup.string().required("Podaj liczbę stanowisk").test("integer",
    "Podaj liczbę całkowitą od 0 do 2147483647", value => /^\d+$/.test(value || "") && Number(value) <= 2147483647);

export function makeSoftwareLicenseValidationSchema() {
    const textFields = Object.fromEntries(licenseTextFields.map(([name, label, limit]) => {
        let schema = Yup.string().test("length", `${label}: przekroczona długość lub nieprawidłowy tekst`, value =>
            !value || (validUnicode(value) && (limit === 65535 ? byteLength(value) : Array.from(value).length) <= limit));
        if (name === "manufacturer" || name === "product") schema = schema.required(`Podaj ${label.toLowerCase()}`)
            .test("not-blank", `Podaj ${label.toLowerCase()}`, value => !!value?.trim());
        return [name, schema];
    }));
    return Yup.object({
        ...textFields,
        licenseType: Yup.string().oneOf(["", "OEM", "Retail", "Volume", "Subscription"], "Wybierz typ licencji"),
        seatsPurchased: seats(),
        seatsUsed: seats().test("capacity", "Zajęte stanowiska nie mogą przekraczać kupionych", function(value) {
            return Number(value) <= Number(this.parent.seatsPurchased);
        }),
        purchaseDate: date(), expirationDate: date(),
        cost: Yup.string().transform(value => typeof value === "string" ? value.replace(",", ".") : value)
            .test("cost", "Podaj koszt brutto od 0 do 9999999999,99 zł, najwyżej dwa miejsca po przecinku",
                value => !value || /^\d{1,10}(\.\d{1,2})?$/.test(value)),
        licenseKey: Yup.string().strict().test("key", "Nieprawidłowy klucz lub przekroczona długość",
            value => !value || (validUnicode(value) && byteLength(value) <= 8388577))
            .when("keyAction", { is: "replace", then: schema => schema.required("Wpisz nowy klucz") }),
        keyAction: Yup.string().oneOf(["keep", "replace", "remove"]).required(),
    });
}
