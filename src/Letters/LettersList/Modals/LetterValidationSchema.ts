import * as Yup from 'yup';
import { valueValidation } from '../../../View/Modals/CommonFormComponents';

const commonFields = {
    _contract: Yup.object()
        .required('Wybież kontrakt'),
    number: Yup.string()
        .required('Numer jest wymagany')
        .max(50, 'Numer może mieć maksymalnie 50 znaków'),

    description: Yup.string()
        .max(1000, 'Opis może mieć maksymalnie 1000 znaków'),
    creationDate: Yup.date().required('Data rozpoczęcia jest wymagana')
        .test('creationDateValidation', 'Pismo nie może być nadane przed utworzeniem',
            function (value: Date) {
                return this.parent.registrationDate >= value;
            }),
    registrationDate: Yup.date().required('Data zakończenia jest wymagana')
        .test('registrationDateValidation', 'Pismo nie może być nadane przed utworzeniem',
            function (value: Date) {
                return value >= this.parent.creationDate;
            }),
    _entitiesMain: Yup.array(),
    _editor: Yup.object()
        .required('Podaj kto rejestruje'),

};

export const ourLetterValidationSchema = Yup.object().shape({
    ...commonFields,
});

export const otherLetterValidationSchema = Yup.object().shape({
    ...commonFields,

});

