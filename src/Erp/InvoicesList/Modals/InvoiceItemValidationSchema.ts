import * as Yup from 'yup';

const commonFields = {
    description: Yup.string()
        .required('To pole jest wymagane')
        .min(10, 'Opis musi zawiera co najmniej 10 znaków')
        .max(700, 'Opis może mieć maksymalnie 700 znaków'),
    quantity: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Ilość musi być większa lub równa 1'),
    unitPrice: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Cena musi być większa lub równa 1'),
    vatTax: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Stawka musi być większa lub równa 1')
        .max(23, 'Stawka musi być mniejsza lub równa 23'),
};

export function InvoiceItemValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
        })
    )
}