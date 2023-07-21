import * as Yup from 'yup';
import { commonFields } from '../../Contracts/ContractsList/ContractDetails/Tasks/Modals/TaskValidationSchema';

export function makeTaskGlobalValidationSchema(isEditing: boolean) {
    return (
        Yup.object().shape({
            ...commonFields,
        })
    )
}