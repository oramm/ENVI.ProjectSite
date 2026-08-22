import * as Yup from "yup";
import { valueValidation } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { validateNipChecksum, normalizeNip } from "./nipValidator";

const name = Yup.string()
    .required("Nazwa jest wymagana")
    .min(3, "Nazwa musi mieć przynajmniej 3 znaki")
    .max(500, "Nazwa może mieć maksymalnie 150 znaków");
const _contractRanges = Yup.array().min(1, "Zakresy są wymagane").required("Zakresy są wymagane");

const status = Yup.string().required("Status jest wymagany");
const value = valueValidation;

/**
 * Termin nieobowiązkowy, który — jeśli podany — nie może wypaść przed zakończeniem umowy.
 *
 * `transform` zamienia pustą wartość na `null` PRZED rzutowaniem na datę. Bez tego Yup.date()
 * robi z "" Invalid Date, walidacja pada i pole, którego wolno nie wypełniać, blokuje zapis —
 * a GeneralModal wyłącza przycisk zapisu przy `!formState.isValid`, więc byłby to twardy
 * blocker rejestracji, nie tylko czerwony komunikat.
 */
function optionalDateAfterEnd(testName: string, message: string) {
    return Yup.date()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" || originalValue === null ? null : value))
        .test(testName, message, function (value: Date | null | undefined) {
            if (!value || !this.parent.endDate) return true;
            return value >= this.parent.endDate;
        });
}

const dateFields = {
    startDate: Yup.date()
        .required("Data rozpoczęcia jest wymagana")
        .test("startDateValidation", "Początek musi być wcześniejszy niż zakończenie", function (value: Date) {
            return this.parent.endDate >= value;
        }),
    endDate: Yup.date()
        .required("Data zakończenia jest wymagana")
        .test("endDateValidation", "Koniec musi być późniejszy niż początek", function (value: Date) {
            return value >= this.parent.startDate;
        }),
    guaranteeEndDate: Yup.date().test(
        "guaranteeEndDateValidation",
        "Gwarancja ma kończyć się zakończeniu umowy",
        function (value: Date | null | undefined) {
            if (!value || !this.parent.endDate) {
                return true; // albo 'true' jeśli chcesz zezwolić na brakujące daty
            }
            return value > this.parent.endDate;
        }
    ),
    // Terminy nieobowiązkowe. `nullable()` + `transform` są tu konieczne, bo puste pole daty
    // przychodzi jako "", a Yup.date() rzutuje "" na Invalid Date i wywala walidację — czyli
    // niewypełnione pole blokowałoby zapis, dokładnie odwrotnie do wymagania właściciela.
    warrantyEndDate: optionalDateAfterEnd(
        "warrantyEndDateValidation",
        "Rękojmia nie może kończyć się przed zakończeniem umowy"
    ),
    defectsNotificationEndDate: optionalDateAfterEnd(
        "defectsNotificationEndDateValidation",
        "Okres zgłaszania wad nie może kończyć się przed zakończeniem umowy"
    ),
};

const commonFields = {
    name,
    _contractRanges,
    status,
    value,
    ...dateFields,
    _type: Yup.object().required("Typ kontraktu jest wymagany"), //przy walidacji jest wpsólny, ale w formularzu jest osobno dla każdego typu
    number: Yup.string().required("Numer jest wymagany").max(50, "Numer może mieć maksymalnie 50 znaków"),
    alias: Yup.string()
        .trim()
        .required("Alias jest wymagany")
        .max(30, "Alias może mieć maksymalnie 30 znaków"),
    comment: Yup.string().max(1000, "Komentarz może mieć maksymalnie 1000 znaków"),
};

/**
 * Yup rule for _employers when _type.name === 'AQM' (WS10/L10, O2).
 * Uniformly applied on create AND edit (owner decision 2026-06-25).
 * Strictly conditional — no regression on other contract types.
 */
const _employersAqmRule = Yup.array().when("_type", {
    is: (type: { name?: string } | null | undefined) => type?.name === "AQM",
    then: (schema) =>
        schema
            .required("Zamawiający jest wymagany dla umowy AQM")
            .min(1, "Umowa AQM wymaga dokładnie 1 Zamawiającego")
            .max(1, "Umowa AQM może mieć tylko 1 Zamawiającego")
            .test(
                "aqm-employer-nip-checksum",
                "Zamawiający musi mieć poprawny NIP (10 cyfr, suma kontrolna) — wymagane dla integracji AQM",
                function (employers: unknown) {
                    const list = employers as Array<{ taxNumber?: string | null }> | null | undefined;
                    if (!list || list.length !== 1) return true; // length already caught by min/max
                    const raw = list[0]?.taxNumber;
                    if (!raw) {
                        return this.createError({
                            message:
                                "Zamawiający nie ma uzupełnionego NIP — wymagany dla integracji AQM. Edytuj podmiot i dodaj poprawny NIP.",
                        });
                    }
                    const normalized = normalizeNip(raw);
                    if (!validateNipChecksum(raw)) {
                        return this.createError({
                            message: `NIP Zamawiającego (${normalized}) jest niepoprawny (błąd sumy kontrolnej) — wymagany dla integracji AQM.`,
                        });
                    }
                    return true;
                },
            ),
    otherwise: (schema) => schema.required("Wybierz Zamawiającego"),
});

/**
 * Confirmation gate for the AQM NAME match (WS10/L11).
 *
 * matchOrganization returns NAME for ANY card with the same name — also one that HAS
 * a NIP — and the AQM upsert keys on legacy_entity_id → NIP → INSERT, never on name.
 * So saving over a NAME match usually creates a SECOND card for the same podmiot.
 * Exception the front cannot see: if this employer was pushed to AQM before, the card
 * is already linked by legacy_entity_id and gets UPDATED instead — the match endpoint
 * only returns hasLegacyEntityId for the name-matched row, not the link target, so the
 * gate asks for a deliberate save rather than asserting which of the two will happen.
 */
const _aqmNameMatchConfirmedRule = Yup.boolean().test(
    "aqm-name-match-confirmed",
    "Potwierdź zapis mimo karty o tej samej nazwie w AQM.",
    function (confirmed: boolean | undefined) {
        const parent = this.parent as {
            _type?: { name?: string } | null;
            _aqmMatchState?: string | null;
        };
        if (parent?._type?.name !== "AQM") return true;
        if (parent?._aqmMatchState !== "NAME") return true;
        return confirmed === true;
    },
);

/**
 * Drzewo struktury: przy rejestracji musi zostać wybrany co najmniej jeden
 * kamień milowy. Reguła NIE obowiązuje przy edycji (drzewa tam nie ma) ani gdy
 * endpoint drzewa padł — bez tej furtki awaria `/contractTemplatesTree`
 * zablokowałaby rejestrację umów w ogóle, bo GeneralModal wyłącza submit przy
 * !formState.isValid. Wtedy serwer nie dostaje wyboru i tworzy strukturę
 * domyślną, czyli zachowuje się jak przed wprowadzeniem drzewa.
 */
const milestonesSelectionRule = (isEditing: boolean) =>
    isEditing
        ? Yup.array().notRequired()
        : Yup.array().test(
              "at-least-one-milestone",
              "Wybierz przynajmniej jeden kamień milowy",
              function (value) {
                  if (this.parent?._contractStructureTreeUnavailable === true) return true;
                  return Array.isArray(value) && value.length > 0;
              },
          );

export function ourContractValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        _milestonesSelection: milestonesSelectionRule(isEditing),
        _contractFoldersSelection: Yup.array().notRequired(),
        _contractStructureTreeUnavailable: Yup.boolean().notRequired(),
        _city: Yup.object().required("Wybierz miasto"),
        _admin: Yup.object().required("Wybierz administratora"),
        _manager: Yup.object().required("Wybierz koordynatora"),
        _employers: _employersAqmRule,
        _invoiceBuyer: Yup.object().nullable().notRequired(),
        // Client-only pair: the match result the form last saw, and the user's confirmation.
        // The server constructor cherry-picks known fields, so both are ignored on POST.
        _aqmMatchState: Yup.string().nullable().notRequired(),
        aqmNameMatchConfirmed: _aqmNameMatchConfirmedRule,
    });
}

export function otherContractValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        _milestonesSelection: milestonesSelectionRule(isEditing),
        _contractFoldersSelection: Yup.array().notRequired(),
        _contractStructureTreeUnavailable: Yup.boolean().notRequired(),
        _contractors: Yup.array(),
        // Lider konsorcjum — pole nieobowiązkowe. Deklarowane jawnie, żeby yupResolver oddał
        // je do zapisu jako LICZBĘ: backend porównuje Id lidera z Id wykonawcy przez ścisłą
        // równość, więc string "241" wróciłby jako 400.
        _leaderEntityId: Yup.number().nullable().notRequired(),
        _ourContract: Yup.object().required("Powiązana umowa Envi jest wymagana"),
    });
}

export function contractNameValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        name,
    });
}

export function contractStatusValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        status,
    });
}

export function contractDatesValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...dateFields,
    });
}
