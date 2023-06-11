import React, { useEffect } from 'react';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from '../../View/Modals/ModalsTypes';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../View/Modals/GeneralModalButtons';
import { Project } from '../../../Typings/bussinesTypes';
import { projectsRepository } from '../TasksGlobalController';
import { makeProjectValidationSchema } from '../../Projects/Modals/ProjectValidationSchema';
import { ProjectModalBody } from '../../Projects/Modals/ProjectModalBody';


/** przycisk i modal edycji Project */
export function ProjectEditModalButton({
    modalProps: { onEdit, initialData, },
    buttonProps
}: SpecificEditModalButtonProps<Project>) {
    return (
        <GeneralEditModalButton<Project>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: ProjectModalBody,
                modalTitle: "Edycja Projektu",
                repository: projectsRepository,
                initialData: initialData,
                makeValidationSchema: makeProjectValidationSchema
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function ProjectAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<Project>) {
    return (
        <GeneralAddNewModalButton<Project>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectModalBody,
                modalTitle: "Dodaj projekt",
                repository: projectsRepository,
                makeValidationSchema: makeProjectValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Dodaj projekt",
                buttonVariant: "outline-success",
            }}
        />
    );
}