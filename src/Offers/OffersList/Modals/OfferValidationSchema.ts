import * as Yup from "yup";

function makecommonFields(isEditing: boolean) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
        _city: Yup.mixed()
            .test(
                "is-object-or-string",
                "Wybierz lub dodaj Miasto",
                (value) => typeof value === "object" || typeof value === "string"
            )
            .test(
                "string-length",
                "Nazwa może mieć maksymalnie 150 znaków",
                (value) => typeof value !== "string" || value.length <= 150
            )
            .required("Wybierz podmiot"),
        _type: Yup.object().required("Wybierz typ kontaktu"),
        alias: Yup.string().required("Nazwa jest wymagana").max(20, "Nazwa może mieć maksymalnie 20 znaków"),
        description: Yup.string().required("Podaj opis ofety").max(500, "Opis może mieć maksymalnie 500 znaków"),
        comment: Yup.string().max(500, "Uwagi mogą mieć maksymalnie 500 znaków"),
        creationDate: isEditing
            ? Yup.date().required("Podaj datę utworzenia")
            : Yup.date().required("Podaj datę utworzenia").max(tomorrow, "Data utworzenia nie może być z przyszłości"),
        submissionDeadline: isEditing
            ? Yup.date().required("Podaj termin składania")
            : Yup.date()
                  .required("Podaj termin składania")
                  .min(new Date(), "Termin składania nie może być z przeszłości"),
        bidProcedure: Yup.string().required("Wybierz procedurę"),
        form: Yup.string().required("Wybierz formę wysyłki"),
        _employer: Yup.mixed()
            .required("Wybierz podmiot")
            .test(
                "is-object-or-string",
                "Wybierz podmiot lub podaj nazwę",
                (value) => typeof value === "object" || typeof value === "string"
            )
            .test(
                "string-length",
                "Nazwa może mieć maksymalnie 150 znaków",
                (value) => typeof value !== "string" || value.length <= 150
            ),
        status: Yup.string().required("Wybierz status oferty"),
    };
}

export function makeOurOfferValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...makecommonFields(isEditing),
    });
}

export function makeOtherOfferValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...makecommonFields(isEditing),
    });
}
