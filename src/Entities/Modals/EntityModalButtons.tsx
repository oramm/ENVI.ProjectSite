import React, { useEffect } from 'react';
import { Entity } from '../../../Typings/bussinesTypes';
import { GeneralAddNewModalButton, GeneralEditModalButton } from '../../View/Modals/GeneralModalButtons';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../View/Modals/ModalsTypes";
import { entitiesRepository } from '../EntitiesController';
import { EntityModalBody } from './EntityModalBody';
import { makeEntityValidationSchema } from './EntityValidationSchema';


export function EntityEditModalButton({
    modalProps: { onEdit, initialData, },
}: SpecificEditModalButtonProps<Entity>) {
    return (
        <GeneralEditModalButton<Entity>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: EntityModalBody,
                modalTitle: "Edycja danych podmiotu",
                repository: entitiesRepository,
                initialData: initialData,
                makeValidationSchema: makeEntityValidationSchema
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function EntityAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<Entity>) {
    return (
        <GeneralAddNewModalButton<Entity>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: EntityModalBody,
                modalTitle: "Dodaj podmiot",
                repository: entitiesRepository,
                makeValidationSchema: makeEntityValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Dodaj podmiot",
                buttonVariant: "outline-success",
            }}
        />
    );
}