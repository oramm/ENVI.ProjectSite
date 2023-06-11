import React, { useEffect } from 'react';
import { Task } from '../../../Typings/bussinesTypes';
import { TaskGlobalModalBody as TaskGlobalModalBody } from './TaskGlobalModalBody';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from '../../View/Modals/ModalsTypes';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../View/Modals/GeneralModalButtons';
import { makeTaskGlobalValidationSchema } from './TaskGlobalValidationSchema';
import { tasksRepository } from '../TasksGlobalController';


/** przycisk i modal edycji Task */
export function TaskEditModalButton({
    modalProps: { onEdit, initialData, },
    buttonProps
}: SpecificEditModalButtonProps<Task>) {
    return (
        <GeneralEditModalButton<Task>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: TaskGlobalModalBody,
                modalTitle: "Edycja zadania",
                repository: tasksRepository,
                initialData: initialData,
                makeValidationSchema: makeTaskGlobalValidationSchema
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function TaskAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<Task>) {
    return (
        <GeneralAddNewModalButton<Task>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: TaskGlobalModalBody,
                modalTitle: "Dodaj zadanie",
                repository: tasksRepository,
                makeValidationSchema: makeTaskGlobalValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Dodaj zadanie",
                buttonVariant: "outline-success",
            }}
        />
    );
}