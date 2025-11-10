import React, { useEffect } from "react";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ContractSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ContractRoleData } from "../../../../Typings/bussinesTypes";
import { CommonRoleFieldsModalBody } from "./CommonRoleFieldsModalBody";

export function ContractRoleModalBody(props: ModalBodyProps<ContractRoleData>) {
    const { isEditing, initialData } = props;
    const {
        register,
        setValue,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        setValue("_contract", initialData?._contract, { shouldDirty: false, shouldValidate: true });
        trigger();
    }, [initialData, setValue]);

    return (
        <>
            <ContractSelector name="_contract" />
            <CommonRoleFieldsModalBody {...props} />
        </>
    );
}
