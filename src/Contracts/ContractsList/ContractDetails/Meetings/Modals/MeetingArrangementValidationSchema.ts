import * as Yup from 'yup';

export function makeMeetingArrangementValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        _case: Yup.object().required('Sprawa jest wymagana'),
        description: Yup.string(),
    });
}
