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
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.ProjectStatuses),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function ContractStatusSelector({
    showValidationInfo = true,
    multiple = false,
    name,
    label,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.ContractStatuses),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function SecurityStatusSelector({
    showValidationInfo = true,
    name = "status",
    label,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.SecurityStatus),
        showValidationInfo,
        name,
        label,
        multiple: false,
        as,
    });
}

export function OfferStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.OfferStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function OfferBondStatusSelector({
    showValidationInfo = true,
    multiple = false,
    name,
    label,
    as,
}: TypeaheadStringSelectorProps & { multiple?: boolean }) {
    return statusSelector({
        statuses: Object.values(MainSetup.OfferBondStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function OfferBondFormSelector({
    showValidationInfo = true,
    name = "form",
    as,
    label = "Forma",
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.OfferBondForm),
        showValidationInfo,
        name,
        label,
        multiple: false,
        as,
    });
}

export function OfferInvitationMailStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.OfferInvitationMailStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function MilestoneStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.MilestoneStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function CaseStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.CaseStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function TaksStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.TaskStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function InvoiceStatusSelector({
    showValidationInfo = true,
    multiple = false,
    name,
    label,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.InvoiceStatuses),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function LetterStatusMultipleSelector({
    showValidationInfo = false,
    multiple = true,
    name,
    label,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: [...Object.values(MainSetup.OurLetterStatus), ...Object.values(MainSetup.IncomingLetterStatus)],
        showValidationInfo,
        name: "statuses",
        label,
        multiple,
        as,
    });
}

export function ApplicationCallStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.ApplicationCallStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function ClientNeedStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.ClientNeedStatus),
        showValidationInfo,
        name: name ?? (multiple ? "statuses" : "status"),
        label,
        multiple,
        as,
    });
}

export function LetterStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: [...Object.values(MainSetup.OurLetterStatus), ...Object.values(MainSetup.IncomingLetterStatus)],
        showValidationInfo,
        name,
        label,
        multiple,
        as,
    });
}

export function OurLetterStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.OurLetterStatus),
        showValidationInfo,
        name,
        label,
        multiple,
        as,
    });
}

export function IncomingLetterStatusSelector({
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps) {
    return statusSelector({
        statuses: Object.values(MainSetup.IncomingLetterStatus),
        showValidationInfo,
        name,
        label,
        multiple,
        as,
    });
}

/**
 * GPO-3 — stan porównania podmiotu z rejestrem GUS, wielokrotny wybór.
 *
 * Jedyny selektor stanów w tym pliku, którego wartością jest KLUCZ (`DIFF_MINOR`), a nie
 * napis po polsku: taki jest zapis w kolumnie `Entities.GusStatus`. Napis, który widzi
 * człowiek, bierze się ze słownika `MainSetup.GusStatus` — tego samego, z którego bierze
 * go plakietka na liście podmiotów.
 */
export function GusStatusSelector({
    showValidationInfo = false,
    name = "gusStatuses",
    label = "Status GUS",
    as,
}: SpecificTextOptionProps) {
    return (
        <TypeaheadStringSelector
            options={Object.keys(MainSetup.GusStatus)}
            optionLabel={(code) => (MainSetup.GusStatus as Record<string, string>)[code] ?? code}
            showValidationInfo={showValidationInfo}
            name={name}
            label={label}
            as={as}
        />
    );
}

function statusSelector({
    statuses,
    showValidationInfo = true,
    name,
    label,
    multiple = false,
    as,
}: SpecificTextOptionProps & { statuses: string[] }) {
    const resolvedName = name ?? (multiple ? "statuses" : "status");
    const resolvedLabel = label ?? (multiple ? "Statusy" : "Status");

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
