import * as Yup from 'yup';

export const commonFields = {
    description: Yup.string()
        .max(300, 'Opis może mieć maksymalnie 300 znaków'),
};

export function makeMultipleCaseValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
            name: Yup.string()
                .required('Nazwa jest wymagana'),
        })
    )
}

export function makeUniqueCaseValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields
        })
    )
}