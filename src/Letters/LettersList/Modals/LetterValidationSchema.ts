import * as Yup from "yup";

const todayUTC = new Date();
todayUTC.setUTCHours(0, 0, 0, 0); // Ustawia godziny na 00:00:00 UTC

const maxDate = new Date(todayUTC);
maxDate.setDate(maxDate.getDate() + 30);

const commonFields = {
    _contract: Yup.object().required("Wybierz kontrakt"),
    _cases: Yup.array().required("Wybierz sprawy"),
    status: Yup.string().required("Wybierz status"),
    description: Yup.string().required("Opis jest wymagany").max(300, "Opis może mieć maksymalnie 300 znaków"),
    creationDate: Yup.date()
        .required("Data utworzenia jest wymagana")
        .max(maxDate, "Data utworzenia nie może być późniejsza niż 30 dni od dziś")
        .test("creationDateValidation", "Pismo nie może być nadane przed utworzeniem", function (value: Date) {
            return this.parent.registrationDate >= value;
        }),
    registrationDate: Yup.date()
        //.required('Data nadania jest wymagana')
        .max(maxDate, "Data nadania nie może być późniejsza niż 30 dni od dziś")
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
