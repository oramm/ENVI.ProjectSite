import React from "react";
import { SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { MilestoneDateData } from "../../../../Typings/bussinesTypes";
import { MilestoneDateModalBody } from "./MilestoneDateModalBody";
import { makeMilestoneDateValidationSchema } from "./MilestoneDateValidationSchema";

export function MilestoneDateEditModalButton({
    modalProps: { onEdit, initialData, repository },
}: SpecificEditModalButtonProps<MilestoneDateData>) {
    if (!repository) {
        throw new Error("repository is required");
    }

    return (
        <GeneralEditModalButton<MilestoneDateData>
            modalProps={{
                onEdit,
                ModalBodyComponent: MilestoneDateModalBody,
                modalTitle: "Edycja daty kamienia milowego",
                repository,
                initialData,
                makeValidationSchema: makeMilestoneDateValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-primary",
            }}
        />
    );
}
