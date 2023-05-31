import * as Yup from 'yup';

const commonFields = {
    _contract: Yup.object()
        .required('Wybierz kontrakt'),
    issueDate: Yup.date()
        .required('Data wystawienia jest wymagana'),
    _entity: Yup.array()
        .required('Wybierz podmiot'),
    daysToPay: Yup.number()
        .required('To pole jest wymagane')
        .min(0, 'Liczba musi być większa lub równa 0')
        .max(60, 'Liczba musi być mniejsza lub równa 60'),
    status: Yup.string()
        .required('Status jest wymagany'),
    _editor: Yup.object()
        .required('Podaj kto rejestruje'),
    description: Yup.string()
        .max(300, 'Opis może mieć maksymalnie 1000 znaków'),

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