import * as Yup from 'yup';
import { valueValidation } from '../../../View/Resultsets/CommonComponents';

const commonFields = {
    _type: Yup.object().required('Typ kontraktu jest wymagany'), //przy walidacji jest wpsólny, ale w formularzu jest osobno dla każdego typu
    name: Yup.string()
        .required('Nazwa jest wymagana')
        .min(3, 'Nazwa musi mieć przynajmniej 3 znaki')
        .max(50, 'Nazwa może mieć maksymalnie 50 znaków'),

    alias: Yup.string(),
    comment: Yup.string()
        .max(100, 'Komentarz może mieć maksymalnie 100 znaków'),
    value: valueValidation,
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
};

export const ourContractValidationSchema = Yup.object().shape({
    ...commonFields,

    ourId: Yup.string()
        .required('Oznaczenie jest wymagane')
        .min(9, 'Oznaczenie musi mieć przynajmniej 9 znaków z kropkami')
        .max(11, 'Oznacznie może mieć maksymalnie 11 znaków')
        .test(
            'threeCharsBeforeFirstDot',
            'Oznaczenie musi mieć 3 znaki przed pierwszą kropką',
            function (value: string) {
                const parts = value.split('.');
                return parts[0].length === 3;
            })
        .test(
            'textAfterFirstDotEqualsType',
            'Po pierwszej kropce musi następować tekst równy wybranemu typowi kontraktu',
            function (value: string) {
                const parts = value.split('.');
                const { _type } = this.parent;
                return _type ? parts[1] === _type.name : false;
            }
        )
        .test(
            'containsTwoDots',
            'Oznaczenie musi zawierać dwie kropki',
            (value: string) => {
                const parts = value.split('.');
                return parts.length === 3;
            }
        ),
});

export const otherContractValidationSchema = Yup.object().shape({
    ...commonFields,
    _contractors: Yup.array(),
    _ourContract: Yup.object()
        .required('Powiązana umowa Envi jest wymagana'),
});
