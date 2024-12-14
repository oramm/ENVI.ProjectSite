import React from "react";
import { OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { contractsRepository } from "../ContractsController";
import { ProjectSelectorModalBody } from "./ContractModalBody";
import { otherContractValidationSchema, ourContractValidationSchema } from "./ContractValidationSchema";
import { OtherContractModalBody } from "./OtherContractModalBody";
import { OurContractModalBody } from "./OurContractModalBody";
import RepositoryReact from "../../../React/RepositoryReact";

/** przycisk i modal edycji OurCOntract lub OtherContract */
export function ContractEditModalButtonGeneric({
    modalProps: { onEdit, initialData, repository, shouldRetrieveDataBeforeEdit },
    buttonProps,
}: SpecificEditModalButtonProps<OurContract | OtherContract>) {
    if (!repository) throw new Error("repository is required");
    return `ourId` in initialData ? (
        <GeneralEditModalButton<OurContract>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurContractModalBody,
                modalTitle: "Edycja umowy",
                repository: repository as RepositoryReact<OurContract>,
                initialData: initialData,
                makeValidationSchema: ourContractValidationSchema,
                shouldRetrieveDataBeforeEdit,
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    ) : (
        <GeneralEditModalButton<OtherContract>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OtherContractModalBody,
                modalTitle: "Edycja umowy",
                repository: repository as RepositoryReact<OtherContract>,
                initialData: initialData,
                makeValidationSchema: otherContractValidationSchema,
                shouldRetrieveDataBeforeEdit,
            }}
            buttonProps={{ ...buttonProps }}
        />
    );
}

export function ContractEditModalButton({
    modalProps: { onEdit, initialData, shouldRetrieveDataBeforeEdit },
    buttonProps,
}: SpecificEditModalButtonProps<OurContract | OtherContract>) {
    return (
        <ContractEditModalButtonGeneric
            modalProps={{
                onEdit,
                initialData,
                repository: contractsRepository,
                shouldRetrieveDataBeforeEdit,
            }}
            buttonProps={buttonProps}
        />
    );
}

export function OurContractAddNewModalButtonGeneric({
    modalProps: { onAddNew, repository },
    buttonProps,
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    if (!repository) throw new Error("repository is required");

    return (
        <GeneralAddNewModalButton<OurContract | OtherContract>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody },
                modalTitle: "Nowa umowa ENVI",
                repository: repository,
                makeValidationSchema: ourContractValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę ENVI",
                buttonVariant: "outline-success",
                ...buttonProps,
            }}
        />
    );
}

export function OurContractAddNewModalButton({
    modalProps: { onAddNew },
    buttonProps,
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    return (
        <OurContractAddNewModalButtonGeneric
            modalProps={{
                onAddNew,
                repository: contractsRepository,
            }}
            buttonProps={buttonProps}
        />
    );
}

export function OtherContractAddNewModalButtonGeneric({
    modalProps: { onAddNew, repository },
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    if (!repository) throw new Error("repository is required");
    return (
        <GeneralAddNewModalButton<OurContract | OtherContract>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody }, // additional props for ProjectSelectorModalBody
                modalTitle: "Nowa umowa zewnętrzna",
                repository: repository,
                makeValidationSchema: otherContractValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę zewnętrzną",
            }}
        />
    );
}

export function OtherContractAddNewModalButton({
    modalProps: { onAddNew },
    buttonProps,
}: SpecificAddNewModalButtonProps<OurContract | OtherContract>) {
    return (
        <OtherContractAddNewModalButtonGeneric
            modalProps={{
                onAddNew,
                repository: contractsRepository,
            }}
            buttonProps={buttonProps}
        />
    );
}
