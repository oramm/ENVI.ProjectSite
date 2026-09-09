import React, { useEffect } from "react";
import { EntityData } from "../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../View/Modals/ModalsTypes";
import { entitiesRepository } from "../EntitiesController";
import { EntityModalBody } from "./EntityModalBody";
import { makeEntityValidationSchema } from "./EntityValidationSchema";

/**
 * GUS-4b — okno podmiotu.
 *
 * `shouldRetrieveDataBeforeEdit` i `buttonProps` idą dalej, bo zakładka „Podmioty w GUS"
 * w panelu administracyjnym otwiera to samo okno z pozycji listy, mając tylko numer
 * i nazwę podmiotu — resztę (w tym migawkę z rejestru) musi dociągnąć modal. Z listy
 * podmiotów przychodzi komplet danych i nic się nie dociąga.
 *
 * PLAKIETKA GUS SIEDZI W CIELE OKNA, NIE W JEGO NAGŁÓWKU (`headerBadge`). Nagłówek dostaje
 * `initialData` przekazane z listy, a przy wejściu z panelu administracyjnego jest to sama
 * zajawka (numer, nazwa, NIP) — plakietka meldowałaby wtedy „nie sprawdzano" przy podmiocie,
 * który różni się od rejestru. Ciało okna dostaje rekord dociągnięty z serwera, więc mówi prawdę.
 */
export function EntityEditModalButton({
    modalProps: { onEdit, initialData, shouldRetrieveDataBeforeEdit },
    buttonProps,
}: SpecificEditModalButtonProps<EntityData>) {
    return (
        <GeneralEditModalButton<EntityData>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: EntityModalBody,
                modalTitle: "Edycja danych podmiotu",
                repository: entitiesRepository,
                initialData: initialData,
                makeValidationSchema: makeEntityValidationSchema,
                shouldRetrieveDataBeforeEdit: shouldRetrieveDataBeforeEdit,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
                ...buttonProps,
            }}
        />
    );
}

export function EntityAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<EntityData>) {
    return (
        <GeneralAddNewModalButton<EntityData>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: EntityModalBody,
                modalTitle: "Dodaj podmiot",
                repository: entitiesRepository,
                makeValidationSchema: makeEntityValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj podmiot",
                buttonVariant: "outline-success",
            }}
        />
    );
}
