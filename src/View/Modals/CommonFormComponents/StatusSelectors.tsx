import React from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "../../../Css/styles.css";

import MainSetup from "../../../React/MainSetupReact";

import {
    TextOptionSelector,
    SpecificTextOptionProps,
    TypeaheadStringSelector,
    TypeaheadStringSelectorProps,
} from "./GenericComponents";

export function ProjectStatusSelector({
    showValidationInfo = true,
    name,
    label = name,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ProjectStatuses).map(([key, value]) => value);
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedLabel}
            label={resolvedLabel}
            as={as}
        />
    );
}

export function ContractStatusSelector({
    showValidationInfo = true,
    multiple,
    name,
    label,
    as,
}: SpecificTextOptionProps) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetup.ContractStatuses).map(([key, value]) => value);
    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector options={statuses} showValidationInfo={showValidationInfo} name={resolvedName} as={as} />
    );
}

export function SecurityStatusSelector({
    showValidationInfo = true,
    name = "status",
    label,
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.SecurityStatus).map(([key, value]) => value);
    return (
        <TextOptionSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={name}
            label={label}
            as={as}
        />
    );
}

export function OfferStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetup.OfferStatus).map(([key, value]) => value);
    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    );
}

export function OfferBondStatusSelector({
    showValidationInfo = true,
    multiple = false,
    name,
    label,
    as,
}: TypeaheadStringSelectorProps & { multiple?: boolean }) {
    const statuses = Object.entries(MainSetup.OfferBondStatus).map(([key, value]) => value);
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    );
}

export function OfferBondFormSelector({
    showValidationInfo = true,
    name = "form",
    as,
    label = name,
}: SpecificTextOptionProps) {
    const forms = Object.entries(MainSetup.OfferBondForm).map(([key, value]) => value);
    return (
        <TextOptionSelector options={forms} showValidationInfo={showValidationInfo} name={name} as={as} label={label} />
    );
}

export function OfferInvitationMailStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetup.OfferInvitationMailStatus).map(([key, value]) => value);
    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    );
}

export function TaksStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.TaskStatus).map(([key, value]) => value);
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    );
}

export function InvoiceStatusSelector({
    showValidationInfo = true,
    multiple = false,
    name,
    label,
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.InvoiceStatuses).map(([key, value]) => value);

    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;

    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector options={statuses} showValidationInfo={showValidationInfo} name={resolvedName} as={as} />
    );
}

export function ApplicationCallStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetup.ApplicationCallStatus).map(([key, value]) => value);
    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    );
}

export function ClientNeedStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? resolvedName;
    const statuses = Object.entries(MainSetup.ClientNeedStatus).map(([key, value]) => value);
    return multiple ? (
        <TypeaheadStringSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    ) : (
        <TextOptionSelector
            options={statuses}
            showValidationInfo={showValidationInfo}
            name={resolvedName}
            label={resolvedLabel}
            as={as}
        />
    );
}
