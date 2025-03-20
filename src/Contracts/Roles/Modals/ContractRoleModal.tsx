import React, { useEffect } from "react";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ContractRoleData, ProjectRoleData } from "../../../../Typings/bussinesTypes";
import { ContractSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { contractsRepository } from "../RolesController";
import { RoleModalBody } from "./RoleModalBody";

export function ContractRoleModalBody(props: ModalBodyProps<ContractRoleData>) {
    const { isEditing, initialData } = props;
    const {
        register,
        reset,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: Partial<ContractRoleData> = {
            _contract: initialData?._contract || undefined,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <ContractSelector repository={contractsRepository} name="_project" />
            <RoleModalBody {...props} />
        </>
    );
}
