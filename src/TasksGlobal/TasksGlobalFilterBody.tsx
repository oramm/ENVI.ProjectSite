import React, { useEffect, useMemo } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Case } from "../../Typings/bussinesTypes";
import { useContract } from "../Contracts/ContractsList/ContractContext";
import MainSetup from "../React/MainSetupReact";
import RepositoryReact from "../React/RepositoryReact";
import {
    CaseSelectMenuElement,
    ContractSelector,
    PersonSelectorPreloaded,
} from "../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../View/Modals/FormContext";
import {
    CaseStatusSelector,
    ContractStatusSelector,
    TaksStatusSelector,
} from "../View/Modals/CommonFormComponents/StatusSelectors";
import { DEFAULT_CASE_STATUS_FILTER } from "../View/Modals/CommonFormComponents/CaseStatusFilter";

export function TasksGlobalFilterBody() {
    const { project } = useContract();
    const { watch, setValue } = useFormContext();
    const _contract = watch("_contract");
    const caseStatuses = watch("caseStatuses");
    const taskStatuses = watch("taskStatuses");

    // Domyślne filtry statusów. Ustawiamy tylko gdy pole jest jeszcze puste — snapshot
    // z sessionStorage (przywracany w FilterPanel) ma pierwszeństwo.
    // - Sprawy: Na zaś + W trakcie (ukrywa Zamknięte).
    // - Zadania: wszystkie statusy (brak filtrowania zadań domyślnie).
    useEffect(() => {
        if (caseStatuses === undefined) setValue("caseStatuses", [...DEFAULT_CASE_STATUS_FILTER]);
        if (taskStatuses === undefined) setValue("taskStatuses", Object.values(MainSetup.TaskStatus));
    }, []);

    const casesFilterRepository = useMemo(
        () =>
            new RepositoryReact<Case>({
                actionRoutes: { getRoute: "cases", addNewRoute: "", editRoute: "", deleteRoute: "" },
                name: "tasksCasesSelectorFilter_temp",
            }),
        [],
    );

    useEffect(() => {
        setValue("_case", undefined);
    }, [_contract?.id]);

    return (
        <Row>
            <Form.Group as={Col} md={6} controlId="_contract">
                <Form.Label>Kontrakt</Form.Label>
                <ContractSelector showValidationInfo={false} _project={project} />
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="_owner">
                <PersonSelectorPreloaded
                    showValidationInfo={false}
                    repository={MainSetup.personsEnviRepository}
                    name="_owner"
                    label="Właściciel"
                />
            </Form.Group>
            <Form.Group as={Col} md={3}>
                <ContractStatusSelector showValidationInfo={false} multiple={true} label="Statusy kontratu" />
            </Form.Group>
            {_contract && (
                <Form.Group as={Col} md={12} className="mt-2">
                    <Form.Label>Sprawa</Form.Label>
                    <CaseSelectMenuElement
                        name="_case"
                        repository={casesFilterRepository}
                        showValidationInfo={false}
                        _contract={_contract}
                        multiple={false}
                    />
                </Form.Group>
            )}
            <Form.Group as={Col} md={3}>
                <CaseStatusSelector
                    showValidationInfo={false}
                    multiple={true}
                    name="caseStatuses"
                    label="Statusy spraw"
                />
            </Form.Group>
            <Form.Group as={Col} md={9}>
                <TaksStatusSelector
                    showValidationInfo={false}
                    multiple={true}
                    name="taskStatuses"
                    label="Statusy zadań"
                />
            </Form.Group>
        </Row>
    );
}
