import React, { useEffect } from "react";
import {
    CaseSelectMenuElement,
    ContractSelectFormElement,
    ProjectSelector,
} from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import MainSetup from "../../React/MainSetupReact";
import { casesRepository, contractsRepository, projectsRepository } from "./LettersController";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";

export function LettersFilterBody() {
    const { register, watch, setValue } = useFormContext();
    const _project = watch("_project");
    const _contract = watch("_contract");
    const _case = watch("_case");
    const allValues = watch();
    useEffect(() => {
        setValue("_contract", undefined);
        setValue("_case", undefined);
    }, [_project]);

    useEffect(() => {
        setValue("_case", undefined);
    }, [_contract]);

    useEffect(() => {
        console.log("Form updated state:", allValues);
    }, [allValues]);
    return (
        <>
            <Row xl={12} md={6} xs={12}>
                <Form.Group as={Col} md={2}>
                    <Form.Label>Szukana fraza</Form.Label>
                    <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
                </Form.Group>
                <DateRangeInput
                    as={Col}
                    sm={12}
                    md={6}
                    lg={4}
                    label="Data utworzenia"
                    fromName="creationDateFrom"
                    toName="creationDateTo"
                    showValidationInfo={false}
                    defaultFromValue={MainSetup.LettersFilterInitState.CREATION_DATE_FROM}
                    defaultToValue={MainSetup.LettersFilterInitState.CREATION_DATE_TO}
                />
                <Form.Group as={Col} xs={12} sm={6} md={4} lg={3} xl={2}>
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
