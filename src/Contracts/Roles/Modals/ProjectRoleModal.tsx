import React, { useEffect } from "react";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ProjectRoleData } from "../../../../Typings/bussinesTypes";
import { ProjectSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { projectsRepository } from "../RolesController";
import { CommonRoleFieldsModalBody } from "./CommonRoleFieldsModalBody";

export function ProjectRoleModalBody(props: ModalBodyProps<ProjectRoleData>) {
    const { isEditing, initialData } = props;
    const { setValue, reset, trigger } = useFormContext();

    useEffect(() => {
        setValue("_project", initialData?._project, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <ProjectSelector repository={projectsRepository} name="_project" />
            <CommonRoleFieldsModalBody {...props} />
        </>
    );
}
