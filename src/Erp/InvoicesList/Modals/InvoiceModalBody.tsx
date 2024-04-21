import React, { useEffect, useRef, useState } from "react";
import {
    ContractSelectFormElement,
    PersonSelectFormElement,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import MainSetup from "../../../React/MainSetupReact";
import { Invoice } from "../../../../Typings/bussinesTypes";
import { contractsRepository, entitiesRepository } from "../InvoicesController";
import { ErrorMessage, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function InvoiceModalBody({ isEditing, initialData }: ModalBodyProps<Invoice>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();
    const statuses = [];
    statuses.push(
        MainSetup.InvoiceStatuses.FOR_LATER,
        MainSetup.InvoiceStatuses.TO_CORRECT,
        MainSetup.InvoiceStatuses.WITHDRAWN
    );
    if (initialData?.status && !statuses.includes(initialData.status)) statuses.push(initialData.status);

    const status = watch("status");
    function setInitialOwner() {
        if (isEditing) return initialData?._owner;
        return MainSetup.getCurrentUserAsPerson();
    }

    useEffect(() => {
        console.log("InvoiceModalBody useEffect", initialData);
        const resetData = {
            _contract: initialData?._contract,
            issueDate: initialData?.issueDate || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            _entity: initialData?._entity,
            status: initialData?.status || "Na później",
            _owner: setInitialOwner(),
            _editor: MainSetup.getCurrentUserAsPerson(),
            description: initialData?.description || "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="_contract">
                <Form.Label>Wybierz kontrakt</Form.Label>
                <ContractSelectFormElement
                    name="_contract"
                    repository={contractsRepository}
                    typesToInclude="our"
                    readOnly={!isEditing}
                />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="issueDate">
                    <Form.Label>Data utworzenia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.issueDate}
                        isInvalid={!!errors.issueDate}
                        {...register("issueDate")}
                    />
                    <ErrorMessage name="issueDate" errors={errors} />
                </Form.Group>
                <Form.Group as={Col} controlId="daysToPay">
                    <Form.Label>Dni do zapłaty</Form.Label>
                    <Form.Control
                        type="number"
                        isValid={!errors.daysToPay}
                        isInvalid={!!errors.daysToPay}
                        min="1"
                        max="60"
                        {...register("daysToPay")}
                    />
                    <ErrorMessage name="daysToPay" errors={errors} />
                </Form.Group>
            </Row>
            <Form.Group controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" isValid={!errors.status} isInvalid={!!errors.status} {...register("status")}>
                    <option value="">-- Wybierz opcję --</option>
                    {statuses.map((statusName, index) => (
                        <option key={index} value={statusName}>
                            {statusName}
                        </option>
                    ))}
                </Form.Control>
                <ErrorMessage errors={errors} name={"status"} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Odbiorca</Form.Label>
                <MyAsyncTypeahead name="_entity" labelKey="name" repository={entitiesRepository} multiple={false} />
            </Form.Group>
            <Form.Group controlId="_owner">
                <PersonSelectFormElement
                    label="Osoba rejestrująca"
                    name="_owner"
                    repository={MainSetup.personsEnviRepository}
                />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Dodaj komentarz"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
        </>
    );
}
