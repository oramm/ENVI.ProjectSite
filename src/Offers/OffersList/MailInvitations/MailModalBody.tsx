import React, { useEffect, useRef, useState } from "react";
import { Col, Form, Placeholder, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { DateRangeInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import MainSetup from "../../../React/MainSetupReact";
import { MailData } from "../../../../Typings/bussinesTypes";

export function MailModalBody({ isEditing, initialData }: ModalBodyProps<MailData>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    const submissionDeadlineFrom = watch("submissionDeadlineFrom");
    const submissionDeadlineTo = watch("submissionDeadlineTo");

    useEffect(() => {
        const resetData = {
            searchText: "",
            incomingDateFrom: MainSetup.OffersInvitationMailFilterInitState.INCOMING_DATE_FROM,
            incomingDateTo: MainSetup.OffersInvitationMailFilterInitState.INCOMING_DATE_TO,
        };
        reset(resetData);

        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group as={Col} md={3}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <DateRangeInput
                as={Col}
                sm={12}
                md={6}
                lg={4}
                label="Termin składania"
                fromName="incomingDateFrom"
                toName="incomingDateTo"
                showValidationInfo={false}
                defaultFromValue={MainSetup.OffersInvitationMailFilterInitState.INCOMING_DATE_FROM}
                defaultToValue={MainSetup.OffersInvitationMailFilterInitState.INCOMING_DATE_TO}
            />
        </>
    );
}
