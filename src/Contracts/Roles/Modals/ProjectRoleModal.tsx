import React, { useEffect } from "react";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ContractRoleData, ProjectRoleData } from "../../../../Typings/bussinesTypes";
import { ProjectSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { projectsRepository } from "../RolesController";
import { RoleModalBody } from "./RoleModalBody";

export function ProjectRoleModalBody(props: ModalBodyProps<ContractRoleData | ProjectRoleData>) {
    const { isEditing, initialData } = props;
    const { reset, trigger } = useFormContext();

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
            <ProjectSelector repository={projectsRepository} name="_project" />
            <RoleModalBody {...props} />
        </>
    );
}
