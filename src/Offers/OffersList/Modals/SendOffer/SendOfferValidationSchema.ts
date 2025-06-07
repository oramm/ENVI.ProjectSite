import * as Yup from "yup";
const _recipients = Yup.array().default([]).min(1, "Wybierz co przynajmniej jednego odbiorcę");
const _gdFilesBasicData = Yup.array().default([]).min(1, "Wybierz co najmniej jeden plik oferty i ew. załączniki");

export function makeSendOfferValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        _newEvent: Yup.object().shape({
            comment: Yup.string().max(500, "Uwagi mogą mieć maksymalnie 500 znaków"),
            additionalMessage: Yup.string().max(500, "Uwagi mogą mieć maksymalnie 500 znaków"),
            _recipients,
            _gdFilesBasicData,
        }),
    });
}

export function makeSendAnotherOfferValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        _newEvent: Yup.object().shape({
            comment: Yup.string()
                .max(500, "Uwagi mogą mieć maksymalnie 500 znaków")
                .required("Komentarz jest wymagany"),
            additionalMessage: Yup.string()
                .max(500, "Uwagi mogą mieć maksymalnie 500 znaków")
                .required("Dodatkowa informacja jest wymagana"),
            _recipients,
            _gdFilesBasicData,
        }),
    });
}
