import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "../../../Css/styles.css";

import MainSetup from "../../../React/MainSetupReact";

import { SelectTextOptionFormElement, SpecificTextOptionProps } from "./GenericComponents";

export function ProjectStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ProjectStatuses).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function ContractStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ContractStatuses).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function SecurityStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.SecurityStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function OfferStatusSelector({ showValidationInfo = true, name = "status", as }: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.OfferStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function OfferBondStatusSelector({ showValidationInfo = true, name = "status", as }: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.OfferBondStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function OfferBondFormSelector({ showValidationInfo = true, name = "form", as }: SpecificTextOptionProps) {
    const forms = Object.entries(MainSetup.OfferBondForm).map(([key, value]) => value);
    return <SelectTextOptionFormElement options={forms} showValidationInfo={showValidationInfo} name={name} as={as} />;
}

export function TaksStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    let statuses = Object.entries(MainSetup.TaskStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function InvoiceStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.InvoiceStatuses).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function ApplicationCallStatusSelector({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ApplicationCallStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function ClientNeedStatusSelector({ showValidationInfo = true, name = "status", as }: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ClientNeedStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}
