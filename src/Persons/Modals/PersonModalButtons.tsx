import React, { useEffect } from 'react';
import { Person } from '../../../Typings/bussinesTypes';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../View/Modals/ModalsTypes";
import { personsRepository } from '../PersonsController';
import { PersonModalBody } from './PersonModalBody';
import { makePersonValidationSchema } from './PersonValidationSchema';


export function PersonEditModalButton({
    modalProps: { onEdit, initialData, },
}: SpecificEditModalButtonProps<Person>) {
    return (
        <GeneralEditModalButton<Person>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: PersonModalBody,
                modalTitle: "Edycja danych osoby",
                repository: personsRepository,
                initialData: initialData,
                makeValidationSchema: makePersonValidationSchema
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function PersonAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<Person>) {
    return (
        <GeneralAddNewModalButton<Person>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: PersonModalBody,
                modalTitle: "Dodaj osobę",
                repository: personsRepository,
                makeValidationSchema: makePersonValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Dodaj osobę",
                buttonVariant: "outline-success",
            }}
        />
    );
}