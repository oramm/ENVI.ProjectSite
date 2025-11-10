import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import {
    ContractRangeSelector,
    ContractSelector,
    ContractTypeSelector,
    PersonSelector,
    ProjectSelector,
} from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { contractsRepository, personsRepository, projectsRepository } from "./RolesController";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { ContractStatusSelector } from "../../View/Modals/CommonFormComponents/StatusSelectors";
import MainSetup from "../../React/MainSetupReact";
import { RoleGroupSelector } from "../../View/Modals/CommonFormComponents/OtherAttributesSelectors";

export function RolesFilterBody() {
    const { register, watch, setValue } = useFormContext();

    const _project = watch("_project");

    useEffect(() => {
        setValue("_contract", undefined);
    }, [_project]);

    return (
        <>
            <Row>
                <Form.Group as={Col} md={6} xl={2}>
                    <Form.Label>Szukana fraza</Form.Label>
                    <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
                </Form.Group>
                <Form.Group as={Col} md={6} xl={2}>
                    <ProjectSelector showValidationInfo={false} />
                </Form.Group>
                <Form.Group as={Col} md={12} xl={5}>
                    <Form.Label>Kontrakt</Form.Label>
                    <ContractSelector
                        name="_contract"
                        typesToInclude="all"
                        showValidationInfo={false}
                        _project={_project}
                    />
                </Form.Group>
                <Form.Group as={Col} xl={3}>
                    <ContractStatusSelector showValidationInfo={false} multiple={true} label="Statusy kontratu" />
                </Form.Group>
            </Row>

            <Row>
                <DateRangeInput
                    as={Col}
                    md={6}
                    lg={4}
                    label="Rozpoczęcie"
                    fromName="startDateFrom"
                    toName="startDateTo"
                    showValidationInfo={false}
                />
                <DateRangeInput
                    as={Col}
                    md={6}
                    lg={4}
                    label="Zakończenie"
                    fromName="endDateFrom"
                    toName="endDateTo"
                    showValidationInfo={false}
                />
                <Form.Group as={Col} xs={12} md={8} lg={4} xl={4} controlId="_person">
                    <Form.Label>Osoba</Form.Label>
                    <PersonSelector name="_person" showValidationInfo={false} />
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} xl={4}>
                    <ContractTypeSelector name="_contractType" showValidationInfo={false} />
                </Form.Group>
                <Form.Group as={Col} xl={4}>
                    <ContractRangeSelector repository={MainSetup.contractRangesRepository} showValidationInfo={false} />
                </Form.Group>
                <Form.Group as={Col} xs={12} md={12} lg={4}>
                    <RoleGroupSelector showValidationInfo={false} />
                </Form.Group>
            </Row>
        </>
    );
}
