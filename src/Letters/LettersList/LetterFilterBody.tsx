import React, { useEffect } from "react";
import {
    CaseSelectMenuElement,
    ContractSelectFormElement,
    ContractTypeSelectFormElement,
    ProjectSelector,
    ValueInPLNInput,
} from "../../View/Modals/CommonFormComponents";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import MainSetup from "../../React/MainSetupReact";
import { casesRepository, contractsRepository, projectsRepository } from "./LettersController";

export function LettersFilterBody() {
    const { register, watch, setValue } = useFormContext();
    const _project = watch("_project");
    const _contract = watch("_contract");
    const _case = watch("_case");

    useEffect(() => {
        setValue("_contract", undefined);
        setValue("_case", undefined);
    }, [_project]);

    useEffect(() => {
        setValue("_case", undefined);
    }, [_contract]);

    return (
        <>
            <Row xl={12} md={6} xs={12}>
                <Form.Group as={Col} md={2}>
                    <Form.Label>Szukana fraza</Form.Label>
                    <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
                </Form.Group>
                <Form.Group as={Col} md={2}>
                    <Form.Label>Utworzono od</Form.Label>
                    <Form.Control
                        type="date"
                        defaultValue={MainSetup.LettersFilterInitState.CREATION_DATE_FROM}
                        {...register("creationDateFrom")}
                    />
                </Form.Group>
                <Form.Group as={Col} md={2}>
                    <Form.Label>Utworzono do</Form.Label>
                    <Form.Control
                        type="date"
                        defaultValue={MainSetup.LettersFilterInitState.CREATION_DATE_TO}
                        {...register("creationDateTo")}
                    />
                </Form.Group>
                <Form.Group as={Col} md={6}>
                    <ProjectSelector repository={projectsRepository} showValidationInfo={false} />
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} md={12}>
                    <Form.Label>Kontrakt</Form.Label>
                    <ContractSelectFormElement
                        repository={contractsRepository}
                        name="_contract"
                        typesToInclude="all"
                        showValidationInfo={false}
                        _project={_project}
                    />
                </Form.Group>
            </Row>
            {_contract && (
                <Row>
                    <Form.Group as={Col} md={12}>
                        <Form.Label>Sprawa</Form.Label>
                        <CaseSelectMenuElement
                            name="_case"
                            repository={casesRepository}
                            showValidationInfo={false}
                            _contract={_contract}
                            multiple={false}
                        />
                    </Form.Group>
                </Row>
            )}
        </>
    );
}
