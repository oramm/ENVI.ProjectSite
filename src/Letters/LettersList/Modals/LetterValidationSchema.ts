import * as Yup from 'yup';

const commonFields = {
    _contract: Yup.object()
        .required('Wybierz kontrakt'),
    _cases: Yup.array()
        .required('Wybierz sprawy'),

    description: Yup.string()
        .max(1000, 'Opis może mieć maksymalnie 1000 znaków'),
    creationDate: Yup.date()
        .required('Data rozpoczęcia jest wymagana')
        .test('creationDateValidation', 'Pismo nie może być nadane przed utworzeniem',
            function (value: Date) {
                return this.parent.registrationDate >= value;
            }),
    registrationDate: Yup.date().required('Data zakończenia jest wymagana')
        .test('registrationDateValidation', 'Pismo nie może być nadane przed utworzeniem',
            function (value: Date) {
                return value >= this.parent.creationDate;
            }),
    _entitiesMain: Yup.array()
        .required('Wybierz podmiot'),
    _editor: Yup.object()
        .required('Podaj kto rejestruje'),

};

export function ourLetterValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
            _template: isEditing ? Yup.object() : Yup.object().required('Wybierz szablon'),
        })
    )
}



export function makeOtherLetterValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
            number: Yup.string()
                .required('Numer jest wymagany')
                .max(50, 'Numer może mieć maksymalnie 50 znaków'),
        })
    )
}

