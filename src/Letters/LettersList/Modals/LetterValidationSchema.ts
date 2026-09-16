import * as Yup from "yup";

const todayUTC = new Date();
todayUTC.setUTCHours(0, 0, 0, 0); // Ustawia godziny na 00:00:00 UTC

const maxDate = new Date(todayUTC);
maxDate.setDate(maxDate.getDate() + 30);

const commonFields = {
    _contract: Yup.object().required("Wybierz kontrakt"),
    // .min(1) obok .required() — `required` przepuszcza pustą tablicę, a pismo bez sprawy
    // serwer po cichu odrzuca (guard w LettersController.editCaseAssociations).
    _cases: Yup.array().min(1, "Wybierz co najmniej jedną sprawę").required("Wybierz sprawy"),
    status: Yup.string().required("Wybierz status").max(30, "Status może mieć maksymalnie 30 znaków"),
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
    responseDueDate: Yup.date()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" ? null : value;
        })
        .test(
            'responseDueDateValidation',
            'Termin odpowiedzi musi być późniejszy lub równy dacie nadania',
            function (value: Date | undefined | null) {
                const { registrationDate } = this.parent;
                if (!value || !registrationDate) {
                    return true;
                }
                return value >= registrationDate;
            }
        ),
    _entitiesMain: Yup.array().min(1, "Wybierz co najmniej jeden podmiot").required("Wybierz podmiot"),
    _editor: Yup.object().required("Podaj kto rejestruje"),
    // 1/0 (nie boolean) — patrz LetterModalBody: przenoszone przez FormData
    addedToApprovedDocumentation: Yup.mixed().notRequired(),
    relatedLetterNumber: Yup.string().max(64, "Numer powiązanego pisma może mieć maksymalnie 64 znaki"),
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
        hasNoNumber: Yup.number().oneOf([0, 1]).default(0),
        numberConflictDetected: Yup.number().oneOf([0, 1]).default(0),
        number: isEditing
            ? Yup.string().required("Numer jest wymagany").max(64, "Numer może mieć maksymalnie 64 znaki")
            : Yup.string()
                  .max(64, "Numer może mieć maksymalnie 64 znaki")
                  .when("hasNoNumber", {
                      is: (value: unknown) => Number(value) !== 1,
                      then: (schema) => schema.required("Numer jest wymagany"),
                      otherwise: (schema) => schema.notRequired(),
                  }),
        duplicateNumberConfirmedFor: Yup.string().when("numberConflictDetected", {
            is: (value: unknown) => Number(value) === 1,
            then: (schema) => schema.required("Potwierdź, że sprawdzone pismo nie jest duplikatem"),
            otherwise: (schema) => schema.notRequired(),
        }),
        responseIKNumber: Yup.string().max(40, "Numer odpowiedzi IK może mieć maksymalnie 40 znaków"),
        file: isEditing
            ? Yup.mixed()
            : Yup.mixed().test(
                  "file-required",
                  "Dodaj plik pisma",
                  (value) => value instanceof FileList && value.length > 0
              ),
    });
}
