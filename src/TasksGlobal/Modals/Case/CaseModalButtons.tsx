import React, { ReactNode } from "react";
import { Badge } from "react-bootstrap";
import { Case, MilestoneData, OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { casesRepository } from "../../TasksGlobalController";
import { TaskAddNewModalButton } from "../TasksGlobalModalButtons";
import { CaseModalBody } from "./CaseModalBody";
import { SubCaseModalBody } from "./SubCaseModalBody";
import { makeCaseValidationSchema } from "./CaseValidationSchema";

export function CaseEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<Case>) {
    const parentCase = initialData?._parentCase;
    const headerBadge = buildCaseHeaderBadge(initialData?._parent as MilestoneData | undefined, parentCase);

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

export function SubCaseAddNewModalButton({
    modalProps: { onAddNew, contextData },
    buttonProps,
}: SpecificAddNewModalButtonProps<Case>) {
    const parentCase = contextData as Case | undefined;
    const headerBadge = buildCaseHeaderBadge(parentCase?._parent as MilestoneData | undefined, parentCase);

    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                contextData,
                ModalBodyComponent: SubCaseModalBody,
                additionalModalBodyProps: {},
                modalTitle: "Nowa podsprawa",
                headerBadge,
                repository: casesRepository,
                makeValidationSchema: makeCaseValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj podsprawę",
                buttonVariant: "outline-primary",
                ...buttonProps,
            }}
        />
    );
}

export function CaseAndSubCaseAddButtonGroup({
    modalProps: { onAddNew, contextData },
    buttonProps,
}: SpecificAddNewModalButtonProps<Case>) {
    return (
        <div className="d-flex gap-2">
            <SubCaseAddNewModalButton
                modalProps={{ onAddNew, contextData }}
                buttonProps={buttonProps}
            />
            <TaskAddNewModalButton
                modalProps={{ onAddNew: onAddNew as any, contextData }}
                buttonProps={buttonProps}
            />
        </div>
    );
}

/** Badge z kontekstem: kontrakt | kamień milowy [| sprawa-rodzic dla podspraw] */
export function buildCaseHeaderBadge(milestone?: MilestoneData, parentCase?: Case): ReactNode {
    const label = buildCaseBreadcrumbLabel(milestone, parentCase);
    if (!label) return undefined;

    return (
        <Badge bg="secondary" text="light" pill className="text-break" style={{ whiteSpace: "normal" }}>
            {label}
        </Badge>
    );
}

/** Buduje czytelną ścieżkę: kontrakt | kamień milowy [| sprawa-rodzic] */
export function buildCaseBreadcrumbLabel(milestone?: MilestoneData, parentCase?: Case): string {
    const contractLabel = buildContractFirstLineLabel(milestone?._contract);
    const milestoneLabel = buildMilestoneNameLabel(milestone);
    const parentCaseLabel = parentCase
        ? (parentCase.name || parentCase._type?.name || parentCase._typeFolderNumber_TypeName_Number_Name || "")
        : "";
    return [contractLabel, milestoneLabel, parentCaseLabel].filter(Boolean).join(" | ").trim();
}

/** Badge z samym kontraktem — używana gdy kamień milowy nie jest jeszcze znany */
export function buildContractHeaderBadge(contract?: OurContract | OtherContract): ReactNode {
    const label = buildContractFirstLineLabel(contract);
    if (!label) return undefined;

    return (
        <Badge bg="secondary" text="light" pill className="text-break" style={{ whiteSpace: "normal" }}>
            {label}
        </Badge>
    );
}

function buildContractFirstLineLabel(contract?: OurContract | OtherContract) {
    if (!contract || typeof contract !== "object") {
        if (contract) console.warn("buildContractFirstLineLabel: oczekiwano obiektu kontraktu, otrzymano:", contract);
        return "";
    }

    // Pola obliczeniowe serwera — dostępne na pełnych obiektach, obsługują oba typy kontraktów
    const computed = (contract as any)._ourIdOrNumber_Alias || (contract as any)._ourIdOrNumber_Name;
    if (computed) return computed;

    const aliasPart = contract.alias;
    if ("ourId" in contract && contract.ourId) {
        return [contract.ourId, aliasPart].filter(Boolean).join(" | ").trim();
    }

    // OtherContract — pomiń "Brak powiązania" gdy _ourContract niedostępny
    const ourRelatedId = (contract as OtherContract)._ourContract?.ourId ?? "";
    const contractId = [`${contract._type?.name ?? ""} ${contract.number}`.trim(), ourRelatedId ? `➔ ${ourRelatedId}` : ""]
        .filter(Boolean)
        .join(" ");
    return [contractId, aliasPart].filter(Boolean).join(" | ").trim();
}

function buildMilestoneNameLabel(milestone?: MilestoneData) {
    if (!milestone) return "";

    const milestoneName = milestone.name || milestone._type?.name;
    return milestoneName ? String(milestoneName).trim() : "";
}
