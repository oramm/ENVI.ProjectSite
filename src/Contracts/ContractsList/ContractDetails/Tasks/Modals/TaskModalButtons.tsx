import React, { useEffect } from 'react';
import { makeTaskValidationSchema } from './TaskValidationSchema';
import { Button } from 'react-bootstrap';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from '../../../../../View/Modals/ModalsTypes';
import { Task } from '../../../../../../Typings/bussinesTypes';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../../../../View/Modals/GeneralModalButtons';
import { TaskModalBody } from './TaskModalBody';
import { tasksRepository } from '../../../ContractsController';


/** przycisk i modal edycji Task */
export function TaskEditModalButton({
    modalProps: { onEdit, initialData, },
    buttonProps
}: SpecificEditModalButtonProps<Task>) {
    return (
        <GeneralEditModalButton<Task>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: TaskModalBody,
                modalTitle: "Edycja zadania",
                repository: tasksRepository,
                initialData: initialData,
                makeValidationSchema: makeTaskValidationSchema
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
                ModalBodyComponent: TaskModalBody,
                modalTitle: "Dodaj zadanie",
                repository: tasksRepository,
                makeValidationSchema: makeTaskValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Dodaj zadanie",
                buttonVariant: "outline-success",
            }}
        />
    );
}