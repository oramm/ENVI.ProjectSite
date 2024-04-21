import * as Yup from "yup";
import { valueValidation } from "../../../View/Modals/CommonFormComponents/GenericComponents";

const name = Yup.string()
    .required("Nazwa jest wymagana")
    .min(3, "Nazwa musi mieć przynajmniej 3 znaki")
    .max(500, "Nazwa może mieć maksymalnie 150 znaków");

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
    status,
    value,
    ...dateFields,
    _type: Yup.object().required("Typ kontraktu jest wymagany"), //przy walidacji jest wpsólny, ale w formularzu jest osobno dla każdego typu
    number: Yup.string().required("Numer jest wymagany").max(50, "Numer może mieć maksymalnie 50 znaków"),
    alias: Yup.string().max(30, "Alias może mieć maksymalnie 30 znaków"),
    comment: Yup.string().max(1000, "Komentarz może mieć maksymalnie 1000 znaków"),
};

export function ourContractValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        _city: Yup.object().required("Wybierz miasto"),
        _admin: Yup.object().required("Wybierz administratora"),
        _manager: Yup.object().required("Wybierz koordynatora"),
        _employers: Yup.array().required("Wybierz Zamawiającego"),
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
