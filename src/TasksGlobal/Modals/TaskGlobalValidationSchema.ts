import * as Yup from 'yup';
import { commonFields } from '../../Contracts/ContractsList/ContractDetails/Tasks/Modals/TaskValidationSchema';

export function makeTaskGlobalValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
            _contract: isEditing ? Yup.object() : Yup.object().required('Wybierz kontrakt'),
            _case: isEditing ? Yup.object() : Yup.object().required('Wybierz sprawę'),
        })
    )
}