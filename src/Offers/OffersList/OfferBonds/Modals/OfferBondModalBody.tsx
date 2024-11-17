import React, { useEffect } from "react";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { Col, Form, Row } from "react-bootstrap";
import { ExternalOffer } from "../../../../../Typings/bussinesTypes";
import { ErrorMessage, ValueInPLNInput } from "../../../../View/Modals/CommonFormComponents/GenericComponents";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import {
    OfferBondFormSelector,
    OfferBondStatusSelector,
} from "../../../../View/Modals/CommonFormComponents/StatusSelectors";
import { hasError } from "../../../../View/Resultsets/CommonComponentsController";

export function OfferBondModalBody({ isEditing, initialData }: ModalBodyProps<ExternalOffer>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();
    const _offerBond = initialData?._offerBond;

    useEffect(() => {
        const resetData = {
            _offerBond: {
                id: _offerBond?.id,
                value: _offerBond?.value,
                form: _offerBond?.form,
                paymentData: _offerBond?.paymentData || "",
                comment: _offerBond?.comment || "",
                status: _offerBond?.status,
                expiryDate: _offerBond?.expiryDate || null,
            },
        };
        reset(resetData);

        trigger();
    }, [initialData, reset, trigger]);

    useEffect(() => {
        console.log(errors); // This logs only when 'errors' object changes
    }, [errors]);

    return (
        <>
            <Row>
                <Form.Group as={Col} controlId="value">
                    <Form.Label>Wartość netto w PLN</Form.Label>
                    <ValueInPLNInput name="_offerBond.value" />
                </Form.Group>
                <OfferBondFormSelector as={Col} name="_offerBond.form" label="Forma" />
            </Row>
            <Form.Group controlId="paymentData">
                <Form.Label>Dane do przelewu</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Wpisz dane do opłacenia wadium"
                    isValid={!hasError(errors, "_offerBond.paymentData")}
                    isInvalid={hasError(errors, "_offerBond.paymentData")}
                    {...register("_offerBond.paymentData")}
                />
                <ErrorMessage name="_offerBond.paymentData" errors={errors} />
            </Form.Group>
            <Form.Group controlId="comment">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add a comment"
                    isValid={!hasError(errors, "_offerBond.comment")}
                    isInvalid={hasError(errors, "_offerBond.comment")}
                    {...register("_offerBond.comment")}
                />
                <ErrorMessage name="_offerBond.comment" errors={errors} />
            </Form.Group>
            <Form.Group as={Col} controlId="expiryDate">
                <Form.Label>Data ważności</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!hasError(errors, "_offerBond.expiryDate")}
                    isInvalid={hasError(errors, "_offerBond.expiryDate")}
                    {...register("_offerBond.expiryDate")}
                />
                <ErrorMessage name="_offerBond.expiryDate" errors={errors} />
            </Form.Group>
            <Form.Group as={Col} controlId="_offerBond.status">
                <OfferBondStatusSelector name="_offerBond.status" label="Status" multiple={false} />
            </Form.Group>
        </>
    );
}
