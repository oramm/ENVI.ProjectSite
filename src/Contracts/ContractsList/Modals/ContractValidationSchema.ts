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

export function ourContractValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        _city: Yup.object().required("Wybierz miasto"),
        _admin: Yup.object().required("Wybierz administratora"),
        _manager: Yup.object().required("Wybierz koordynatora"),
        _employers: _employersAqmRule,
        _invoiceBuyer: Yup.object().nullable().notRequired(),
    });
}

export function otherContractValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        _contractors: Yup.array(),
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
