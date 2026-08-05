import React from "react";
import {
    CityData,
    ContractRangeData,
    EntityData,
    FinancialAidProgrammeData,
    FocusAreaData,
    PersonData,
} from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";
import { InlineCreateDrawer } from "./InlineCreateDrawer";
import { EntityModalBody } from "../../Entities/Modals/EntityModalBody";
import { makeEntityValidationSchema } from "../../Entities/Modals/EntityValidationSchema";
import { CityModalBody } from "../../Admin/Cities/Modals/CityModalBody";
import { makeCityValidationSchema } from "../../Admin/Cities/Modals/CityValidationSchema";
import { FinancialAidProgrammeModalBody } from "../../financialAidProgrammes/Programmes/Modals/FinancialAidProgrammeModalBody";
import { makeFinancialAidProgrammeValidationSchema } from "../../financialAidProgrammes/Programmes/FinancialAidProgrammeValidationSchema";
import { FocusAreaModalBody } from "../../financialAidProgrammes/FocusAreas/Modals/FocusAreaModalBody";
import { makeFocusAreaValidationSchema } from "../../financialAidProgrammes/FocusAreas/FocusAreaValidationSchema";
import { financialAidProgrammesRepository } from "../../financialAidProgrammes/FinancialAidProgrammesController";
import { focusAreasRepository } from "../../financialAidProgrammes/FocusAreas/FocusAreasController";
import { PersonModalBody } from "../../Persons/Modals/PersonModalBody";
import { makePersonValidationSchema } from "../../Persons/Modals/PersonValidationSchema";
import { ContractRangeModalBody } from "../../Admin/ContractRanges/Modals/ContractRangeModalBody";
import { makeContractRangeValidationSchema } from "../../Admin/ContractRanges/Modals/ContractRangeValidationSchema";
import { contractRangesRepository as contractRangesAdminRepository } from "../../Admin/ContractRanges/ContractRangesController";

interface DrawerBaseProps<T> {
    show: boolean;
    onHide: () => void;
    title: string;
    onCreated: (created: T) => void;
}

export function EntityInlineCreateDrawer({
    repository,
    ...props
}: DrawerBaseProps<EntityData> & { repository: RepositoryReact<EntityData> }) {
    return (
        <InlineCreateDrawer<EntityData>
            repository={repository}
            ModalBodyComponent={EntityModalBody}
            makeValidationSchema={makeEntityValidationSchema}
            {...props}
        />
    );
}

export function CityInlineCreateDrawer({
    repository,
    ...props
}: DrawerBaseProps<CityData> & { repository: RepositoryReact<CityData> }) {
    return (
        <InlineCreateDrawer<CityData>
            repository={repository}
            ModalBodyComponent={CityModalBody}
            makeValidationSchema={makeCityValidationSchema}
            {...props}
        />
    );
}

export function FinancialAidProgrammeInlineCreateDrawer(props: DrawerBaseProps<FinancialAidProgrammeData>) {
    return (
        <InlineCreateDrawer<FinancialAidProgrammeData>
            repository={financialAidProgrammesRepository}
            ModalBodyComponent={FinancialAidProgrammeModalBody}
            makeValidationSchema={makeFinancialAidProgrammeValidationSchema}
            {...props}
        />
    );
}

export function FocusAreaInlineCreateDrawer(props: DrawerBaseProps<FocusAreaData>) {
    return (
        <InlineCreateDrawer<FocusAreaData>
            repository={focusAreasRepository}
            ModalBodyComponent={FocusAreaModalBody}
            makeValidationSchema={makeFocusAreaValidationSchema}
            {...props}
        />
    );
}

/**
 * Zakresy kontraktu są słownikiem administracyjnym — repozytorium z routami zapisu
 * mieszka w Admin/ContractRanges (to z ContractsController jest read-only).
 */
export function ContractRangeInlineCreateDrawer(props: DrawerBaseProps<ContractRangeData>) {
    return (
        <InlineCreateDrawer<ContractRangeData>
            repository={contractRangesAdminRepository}
            ModalBodyComponent={ContractRangeModalBody}
            makeValidationSchema={makeContractRangeValidationSchema}
            {...props}
        />
    );
}

export function PersonInlineCreateDrawer({
    repository,
    ...props
}: DrawerBaseProps<PersonData> & { repository: RepositoryReact<PersonData> }) {
    return (
        <InlineCreateDrawer<PersonData>
            repository={repository}
            ModalBodyComponent={PersonModalBody}
            makeValidationSchema={makePersonValidationSchema}
            {...props}
        />
    );
}
