import * as Yup from 'yup';

const commonFields = {
    _contract: Yup.object()
        .required('Wybierz kontrakt'),
    issueDate: Yup.date()
        .required('Data wystawienia jest wymagana'),
    _entity: Yup.object()
        .required('Wybierz podmiot'),
    daysToPay: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Liczba musi być większa lub równa 0')
        .max(60, 'Liczba musi być mniejsza lub równa 60'),
    status: Yup.string()
        .required('Status jest wymagany'),
    _owner: Yup.object()
        .required('Podaj kto rejestruje'),
    description: Yup.string()
        .max(500, 'Opis może mieć maksymalnie 500 znaków'),
};

export function makeInvoiceValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
        })
    )
}

export function makeInvoiceIssueValidationSchema() {
    return (
        Yup.object().shape({
            number: Yup.string()
                .min(6, 'Numer musi mieć co najmniej 6 znaków')
                .max(9, 'Numer może mieć maksymalnie 9 znaków'),
            file: Yup.mixed()
                .test('file', 'Plik jest wymagany', (value: any) => {
                    console.log('issueInvoiceSchema:', value);
                    return value && value.length > 0;
                })

        })
    )
}

export function makeInvoiceSetAsSentValidationSchema() {
    return (
        Yup.object().shape({
            sentDate: Yup.date()
                .required('Data nadania jest wymagana'),
        })
    )
}