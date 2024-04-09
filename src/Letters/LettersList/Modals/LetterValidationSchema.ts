import * as Yup from "yup";

const commonFields = {
    _contract: Yup.object().required("Wybierz kontrakt"),
    _cases: Yup.array().required("Wybierz sprawy"),

    description: Yup.string().required("Opis jest wymagany").max(300, "Opis może mieć maksymalnie 300 znaków"),
    creationDate: Yup.date()
        .required("Data utworzenia jest wymagana")
        .max(new Date(), "Data utworzenia nie może być z przyszłości")
        .test("creationDateValidation", "Pismo nie może być nadane przed utworzeniem", function (value: Date) {
            return this.parent.registrationDate >= value;
        }),
    registrationDate: Yup.date()
        //.required('Data nadania jest wymagana')
        .max(new Date(), "Data nadania nie może być z przyszłości")
        .test(
            "registrationDateValidation",
            "Pismo nie może być nadane przed utworzeniem",
            function (value: Date | undefined) {
                if (value === undefined) return true;
                return value >= this.parent.creationDate;
            }
        ),
    _entitiesMain: Yup.array().required("Wybierz podmiot"),
    _editor: Yup.object().required("Podaj kto rejestruje"),
};

export function ourLetterValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        _template: isEditing ? Yup.object() : Yup.object().required("Wybierz szablon"),
    });
}

export function makeOtherLetterValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...commonFields,
        number: Yup.string().required("Numer jest wymagany").max(50, "Numer może mieć maksymalnie 50 znaków"),
    });
}
