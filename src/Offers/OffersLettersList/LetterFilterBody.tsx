import React, { useEffect } from "react";
import {
    CaseSelectMenuElement,
    OfferSelectFormElement,
} from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import MainSetup from "../../React/MainSetupReact";
import { casesRepository, offersRepository } from "./LettersController";

export function LettersFilterBody() {
    const { register, watch, setValue } = useFormContext();
    const _offer = watch("_offer");
    const _case = watch("_case");

    useEffect(() => {
        setValue("_case", undefined);
    }, [_offer]);

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
            </Row>
            <Row>
                <Form.Group as={Col} md={12}>
                    <Form.Label>Oferta</Form.Label>
                    <OfferSelectFormElement repository={offersRepository} name="_offer" showValidationInfo={false} />
                </Form.Group>
            </Row>

            {_offer && (
                <Row>
                    <Form.Group as={Col} md={12}>
                        <Form.Label>Sprawa</Form.Label>
                        <CaseSelectMenuElement
                            name="_case"
                            repository={casesRepository}
                            showValidationInfo={false}
                            _offer={_offer}
                            multiple={false}
                        />
                    </Form.Group>
                </Row>
            )}
        </>
    );
}
