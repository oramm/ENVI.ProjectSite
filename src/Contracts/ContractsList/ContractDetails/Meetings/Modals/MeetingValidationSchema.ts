import * as Yup from 'yup';

export function makeMeetingValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        name: Yup.string().required('Nazwa spotkania jest wymagana'),
        date: Yup.date().required('Data spotkania jest wymagana'),
        location: Yup.string(),
    });
}
