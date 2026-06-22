import React, { useEffect, useRef, useState } from "react";
import MainSetup from "../../../React/MainSetupReact";
import {
    CitySelector,
    ContractTypeSelector,
    EntitySelector,
    PersonSelectorPreloaded,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ContractModalBody } from "./ContractModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { Col, Form, Row } from "react-bootstrap";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { citiesRepository, entitiesRepository } from "../ContractsController";
import { CityData, EntityData, OurContract } from "../../../../Typings/bussinesTypes";
import { MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { CityInlineCreateDrawer, EntityInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";

export function OurContractModalBody(props: ModalBodyProps<OurContract>) {
    const { initialData, isEditing } = props;
    const {
        register,
        trigger,
        setValue,
        watch,
        formState: { errors },
        control,
    } = useFormContext();
    const _type = watch("_type");
    const [showCreateCity, setShowCreateCity] = useState(false);
    const [showCreateEmployer, setShowCreateEmployer] = useState(false);

    useEffect(() => {
        setValue("_type", initialData?._type, { shouldValidate: true });
        setValue("ourId", initialData?.ourId || "", { shouldValidate: true });
        setValue("_city", initialData?._city, { shouldValidate: true });
        setValue("_admin", initialData?._admin, { shouldValidate: true });
        setValue("_manager", initialData?._manager, { shouldValidate: true });
        setValue("_employers", initialData?._employers, { shouldValidate: true });
    }, [initialData, setValue]);

    function handleCityCreated(created: CityData) {
        setValue("_city", created, { shouldValidate: true });
    }

    function handleEmployerCreated(created: EntityData) {
        const current = (watch("_employers") as EntityData[]) || [];
        setValue("_employers", [...current, created], { shouldValidate: true });
    }

    return (
        <>
            <Row>
                <Form.Group as={Col} controlId="_city">
                    <Form.Label>Miasto</Form.Label>
                    <CitySelector showValidationInfo={true} onRequestCreate={() => setShowCreateCity(true)} />
                </Form.Group>
                {!isEditing && (
                    <Form.Group as={Col} controlId="_type">
                        <ContractTypeSelector typesToInclude="our" />
                    </Form.Group>
                )}
            </Row>
            <ContractModalBody {...props} />
            <Row>
                <Form.Group as={Col} controlId="_manager">
                    <PersonSelectorPreloaded
                        label="Koordynator"
                        name="_manager"
                        repository={MainSetup.personsEnviRepository}
                    />
                </Form.Group>
                <Form.Group as={Col} controlId="_admin">
                    <PersonSelectorPreloaded
                        label="Administrator"
                        name="_admin"
                        repository={MainSetup.personsEnviRepository}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Zamawiający</Form.Label>
                    <EntitySelector name="_employers" multiple={true} onRequestCreate={() => setShowCreateEmployer(true)} />
                </Form.Group>
            </Row>
            <CityInlineCreateDrawer
                show={showCreateCity}
                onHide={() => setShowCreateCity(false)}
                title="Nowe miasto"
                repository={citiesRepository}
                onCreated={handleCityCreated}
            />
            <EntityInlineCreateDrawer
                show={showCreateEmployer}
                onHide={() => setShowCreateEmployer(false)}
                title="Nowy podmiot (zamawiający)"
                repository={entitiesRepository}
                onCreated={handleEmployerCreated}
            />
        </>
    );
}
