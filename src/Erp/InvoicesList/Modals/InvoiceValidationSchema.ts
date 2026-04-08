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
    isJstSubordinate: Yup.boolean(),
    isGvMember: Yup.boolean(),
    includeThirdParty: Yup.boolean().when(['isJstSubordinate', 'isGvMember'], {
        is: (isJstSubordinate: boolean, isGvMember: boolean) => Boolean(isJstSubordinate) || Boolean(isGvMember),
        then: (schema) => schema.oneOf([true], 'Podmiot 3 jest wymagany dla JST/GV'),
        otherwise: (schema) => schema,
    }),
    addAnotherThirdParty: Yup.boolean(),
    _thirdParties: Yup.array()
        .of(
            Yup.object().shape({
                _entity: Yup.object().required('Wybierz podmiot 3'),
                role: Yup.number()
                    .nullable()
                    .typeError('Wybierz rolę podmiotu 3')
                    .required('Wybierz rolę podmiotu 3')
                    .integer('Rola musi być liczbą całkowitą')
                    .min(1, 'Rola musi być w zakresie 1-10')
                    .max(10, 'Rola musi być w zakresie 1-10'),
            })
        )
        .when('includeThirdParty', {
            is: true,
            then: (schema) => schema.min(1, 'Dodaj co najmniej jeden Podmiot 3'),
            otherwise: (schema) => schema.max(0),
        })
        .test('jst-role-8', 'Dla JST wymagany jest Podmiot 3 z rolą 8', function (value) {
            if (!this.parent.isJstSubordinate) return true;
            return Boolean((value || []).some((item: any) => Number(item?.role) === 8));
        })
        .test('gv-role-10', 'Dla GV wymagany jest Podmiot 3 z rolą 10', function (value) {
            if (!this.parent.isGvMember) return true;
            return Boolean((value || []).some((item: any) => Number(item?.role) === 10));
        }),
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