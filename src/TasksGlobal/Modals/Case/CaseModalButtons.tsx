import React from "react";
import { Badge } from "react-bootstrap";
import { Case, MilestoneData, OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { casesRepository } from "../../TasksGlobalController";
import { CaseModalBody } from "./CaseModalBody";
import { makeCaseValidationSchema } from "./CaseValidationSchema";

export function CaseEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<Case>) {
    const headerBadge = buildCaseHeaderBadge(initialData?._parent as MilestoneData | undefined);

    return (
        <GeneralEditModalButton<Case>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: CaseModalBody,
                modalTitle: "Edycja sprawy",
                headerBadge,
                repository: casesRepository,
                initialData: initialData,
                makeValidationSchema: makeCaseValidationSchema,
            }}
            buttonProps={{
                ...buttonProps,
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function CaseAddNewModalButton({
    modalProps: { onAddNew, contextData },
    buttonProps,
}: SpecificAddNewModalButtonProps<Case>) {
    const headerBadge = buildCaseHeaderBadge(contextData as MilestoneData | undefined);

    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                contextData,
                ModalBodyComponent: CaseModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: CaseModalBody },
                modalTitle: "Nowa sprawa",
                headerBadge,
                repository: casesRepository,
                makeValidationSchema: makeCaseValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj sprawę",
                buttonVariant: "outline-success",
                ...buttonProps,
            }}
        />
    );
}

function buildCaseHeaderBadge(milestone?: MilestoneData) {
    const label = buildContractMilestoneLabel(milestone);
    if (!label) return undefined;

    return (
        <Badge bg="secondary" text="light" pill className="text-break" style={{ whiteSpace: "normal" }}>
            {label}
        </Badge>
    );
}

function buildContractMilestoneLabel(milestone?: MilestoneData) {
    if (!milestone) return "";

    const contractLabel = buildContractFirstLineLabel(milestone._contract);
    const milestoneLabel = buildMilestoneNameLabel(milestone);
    return [contractLabel, milestoneLabel].filter(Boolean).join(" | ").trim();
}

function buildContractFirstLineLabel(contract?: OurContract | OtherContract) {
    if (!contract) return "";

    const aliasPart = contract.alias;
    if ("ourId" in contract) {
        return [contract.ourId, aliasPart].filter(Boolean).join(" | ").trim();
    }

    const ourRelatedId = contract._ourContract ? contract._ourContract.ourId : "Brak powiązania";
    const identifier = `${contract._type.name} ${contract.number} ➔ ${ourRelatedId}`;
    return [identifier, aliasPart].filter(Boolean).join(" | ").trim();
}

function buildMilestoneNameLabel(milestone?: MilestoneData) {
    if (!milestone) return "";

    const milestoneName = milestone.name || milestone._type?.name;
    return milestoneName ? String(milestoneName).trim() : "";
}
