import * as Yup from 'yup';
import { valueValidation } from '../../View/Modals/CommonFormComponents';

const commonFields = {
    name: Yup.string()
        .required('Nazwa jest wymagana')
        .min(3, 'Nazwa musi mieć przynajmniej 3 znaki')
        .max(500, 'Nazwa może mieć maksymalnie 150 znaków'),
    comment: Yup.string()
        .max(1000, 'Komentarz może mieć maksymalnie 1000 znaków'),

    alias: Yup.string()
        .max(30, 'Alias może mieć maksymalnie 30 znaków'),
    value: Yup.string(),
    status: Yup.string().required('Status jest wymagany'),
    startDate: Yup.date().required('Data rozpoczęcia jest wymagana')
        .test('startDateValidation', 'Początek musi być wcześniejszy niż zakończenie',
            function (value: Date) {
                return this.parent.endDate > value;
            }),
    endDate: Yup.date().required('Data zakończenia jest wymagana')
        .test('endDateValidation', 'Koniec musi być późniejszy niż początek',
            function (value: Date) {
                return value > this.parent.startDate;
            }),
    _contractors: Yup.array(),
    ourId: Yup.string()
        .required('Oznaczenie jest wymagane')
        .min(9, 'Oznaczenie musi mieć przynajmniej 9 znaków z kropkami')
        .max(19, 'Oznacznie może mieć maksymalnie 19 znaków')
        .test(
            'threeCharsBeforeFirstDot',
            'Oznaczenie musi mieć 3 znaki przed pierwszą kropką',
            function (value: string) {
                const parts = value.split('.');
                return parts[0].length === 3;
            })
        .test(
            'containsThreeDots',
            'Oznaczenie musi zawierać 3 kropki',
            (value: string) => {
                const parts = value.split('.');
                return parts.length === 4;
            }
        ),
};

export function makeProjectValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,


        })
    )
}
