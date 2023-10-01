import * as Yup from 'yup';
import { valueValidation } from '../../../../View/Modals/CommonFormComponents';

function getCommonFields(isEditing: boolean) {
    return {
        _contract: !isEditing ? Yup.object().required('Umowa jest wymagana') : Yup.object(),
        description: Yup.string()
            .max(300, 'Komentarz może mieć maksymalnie 300 znaków'),
        value: valueValidation,
        returnedValue: valueValidation,
    };
}

export function securityCashValidationSchema(isEditing: boolean) {
    return Yup.object().shape(getCommonFields(isEditing));
}

export function SecurityGuaranteeValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        ...getCommonFields(isEditing),
        firstPartExpiryDate: Yup.date().required('Data jest wymagana'),
        secondPartExpiryDate: Yup.date().required('Data jest wymagana')
    });
}