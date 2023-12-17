import React, { useEffect, useRef, useState } from "react";
import {
    CitySelectFormElement,
    ContractTypeSelectFormElement,
    ErrorMessage,
    FileInput,
    MyAsyncTypeahead,
    OfferBidProcedureSelectFormElement,
    OfferFormSelectFormElement,
    OfferStatusSelectFormElement,
    PersonSelectFormElement,
    ProjectSelector,
} from "../../View/Modals/CommonFormComponents";
import { Col, Form, Placeholder, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { Case, Contract, ExternalOffer, OurOffer, Project, RepositoryDataItem } from "../../../Typings/bussinesTypes";
import { entitiesRepository } from "../OffersController";
import { citiesRepository } from "../../Admin/Cities/CitiesController";

export function OfferModalBody({ isEditing, initialData }: ModalBodyProps<OurOffer | ExternalOffer>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            _city: initialData?._city,
            _type: initialData?._type,
            _employer: initialData?.employerName || "",
            alias: initialData?.alias || "",
            description: initialData?.description || "",
            submissionDeadline: initialData?.submissionDeadline || new Date().toISOString().slice(0, 10),
            status: initialData?.status || "",
            bidProcedure: initialData?.bidProcedure || "",
            form: initialData?.form || "",
            _editor: initialData?._editor,
        };
        reset(resetData);

        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Row>
                <Form.Group as={Col} controlId="_city">
                    <Form.Label>Miasto</Form.Label>
                    <CitySelectFormElement repository={citiesRepository} showValidationInfo={true} allowNew={true} />
                </Form.Group>
                {!isEditing && (
                    <Form.Group as={Col} controlId="_type">
                        <ContractTypeSelectFormElement typesToInclude="our" />
                    </Form.Group>
                )}
            </Row>
            <Form.Group>
                <Form.Label>Zamawiający</Form.Label>
                <MyAsyncTypeahead name="_employer" labelKey="name" repository={entitiesRepository} multiple={false} />
                <ErrorMessage errors={errors} name="_employer" />
            </Form.Group>
            <Form.Group controlId="alias">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj alias"
                    isValid={!errors?.alias}
                    isInvalid={!!errors?.alias}
                    {...register("alias")}
                />
                <ErrorMessage errors={errors} name="alias" />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>

            <Form.Group as={Col} controlId="submissionDeadline">
                <Form.Label>Termin składania</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.submissionDeadline}
                    isInvalid={!!errors.submissionDeadline}
                    {...register("submissionDeadline")}
                />
                <ErrorMessage name="submissionDeadline" errors={errors} />
            </Form.Group>

            <Row>
                <OfferBidProcedureSelectFormElement as={Col} />
                <OfferFormSelectFormElement as={Col} />
            </Row>
            <OfferStatusSelectFormElement />
        </>
    );
}
