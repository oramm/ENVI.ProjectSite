import React from "react";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { MilestoneDateData } from "../../../../Typings/bussinesTypes";
import { MilestoneDateModalBody } from "./MilestoneDateModalBody";
import { milestoneDatesRepository } from "../MilestoneDatesController";
import { makeMilestoneDateValidationSchema } from "./MilestoneDateValidationSchema";

export function MilestoneDateEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<MilestoneDateData>) {
    return (
        <GeneralEditModalButton<MilestoneDateData>
            modalProps={{
                onEdit,
                ModalBodyComponent: MilestoneDateModalBody,
                modalTitle: "Edycja daty kamienia milowego",
                repository: milestoneDatesRepository,
                initialData,
                makeValidationSchema: makeMilestoneDateValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-primary",
            }}
        />
    );
}
