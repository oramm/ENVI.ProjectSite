import * as Yup from 'yup';

const commonFields = {
    name: Yup.string()
        .required('Podaj nazwę')
        .min(3, 'Nazwa musi mieć co najmniej 3 znaki')
        .max(150, 'Nazwa może mieć maksymalnie 150 znaków'),
    code: Yup.string()
        .default('')
        .min(3, 'Kod musi mieć 3 znaki')
        .max(3, 'Kod musi mieć 3 znaki'),
};

export function makeCityValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
        })
    );
}

