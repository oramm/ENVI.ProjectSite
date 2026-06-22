import React from "react";
import { CityData, EntityData, FinancialAidProgrammeData, FocusAreaData } from "../../../Typings/bussinesTypes";
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
