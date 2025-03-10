import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ContractRoleData, ProjectRoleData } from "../../../../Typings/bussinesTypes";
import { ContractSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { contractsRepository, personsRepository, projectsRepository } from "../RolesController";
import { RoleModalBody } from "./RoleModalBody";

export function ContractRoleModalBody(props: ModalBodyProps<ContractRoleData | ProjectRoleData>) {
    const { isEditing, initialData } = props;
    const {
        register,
        reset,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            name: initialData?.name,
            description: initialData?.description,
            groupName: initialData?.groupName,
            _person: initialData?._person,
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
