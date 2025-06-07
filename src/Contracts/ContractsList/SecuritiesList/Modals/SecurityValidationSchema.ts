import * as Yup from "yup";
import { valueValidation } from "../../../../View/Modals/CommonFormComponents/GenericComponents";

const status = Yup.string().required("Status jest wymagany");
const description = Yup.string().max(300, "Komentarz może mieć maksymalnie 300 znaków");
const value = valueValidation;
const returnedValue = valueValidation;

function getCommonFields(isEditing: boolean) {
    return {
        _contract: !isEditing ? Yup.object().required("Umowa jest wymagana") : Yup.object(),
        description,
        value,
        returnedValue,
        status,
    };
}

const dateFields = {
    firstPartExpiryDate: Yup.date().required("Data jest wymagana"),
    secondPartExpiryDate: Yup.date().required("Data jest wymagana"),
};

export function securityCashValidationSchema(isEditing: boolean) {
    return Yup.object().shape(getCommonFields(isEditing));
}

export function securityGuaranteeValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...getCommonFields(isEditing),
        ...dateFields,
    });
}

export function securityStatusValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        status,
    });
}

export function securityDescriptionValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        description,
    });
}

export function securityValueValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        value,
    });
}

export function securityReturnedValueValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        returnedValue,
    });
}

export function suecurityDatesValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...dateFields,
    });
}
