import * as Yup from 'yup';

export const commonFields = {
    name: Yup.string()
        .required('Nazwa jest wymagana'),
    description: Yup.string()
        .max(300, 'Opis może mieć maksymalnie 300 znaków'),
    deadline: Yup.date(),
    status: Yup.string()
        .required('Status jest wymagany'),
    _owner: Yup.object()
        .required('Przypisz właściciela'),

};

export function makeTaskValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
            _contract: isEditing ? Yup.object() : Yup.object().required('Wybierz kontrakt'),

        })
    )
}