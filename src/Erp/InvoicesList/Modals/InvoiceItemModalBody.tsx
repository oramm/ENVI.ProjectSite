import React, { useEffect, useRef, useState } from 'react';
import { ErrorMessage, ValueInPLNInput } from '../../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import { InvoiceItem } from '../../../../Typings/bussinesTypes';
import { useInvoice } from '../InvoiceDetails/InvoiceDetails';
import MainSetup from '../../../React/MainSetupReact';


export function InvoiceItemModalBody({ initialData }: ModalBodyProps<InvoiceItem>) {
    const { register, reset, formState: { errors }, trigger } = useFormContext();
    const invoice = useInvoice();
    useEffect(() => {

        console.log('InvoiceModalBody useEffect', initialData);
        const resetData = {
            _parent: initialData?._parent || invoice,
            description: initialData?.description || '',
            quantity: initialData?.quantity || 1,
            unitPrice: initialData?.unitPrice,
            vatTax: initialData?.vatTax || 23,
            _editor: MainSetup.getCurrentUserAsPerson(),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Dodaj komentarz"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register('description')}
                />
                <ErrorMessage name='description' errors={errors} />
            </Form.Group>
            <Row >
                <Form.Group as={Col} controlId="quantity">
                    <Form.Label>Ilość</Form.Label>
                    <Form.Control
                        type="number"
                        min="1"
                        isValid={!errors?.quantity}
                        isInvalid={!!errors?.quantity}
                        {...register('quantity')}
                    />
                    <ErrorMessage name='quantity' errors={errors} />
                </Form.Group>
                <Form.Group as={Col} controlId="unitPrice">
                    <Form.Label>Cena jedn.</Form.Label>
                    <ValueInPLNInput keyLabel='unitPrice' />
                </Form.Group>
                <Form.Group as={Col} controlId="vatTax">
                    <Form.Label>Stawka VAT</Form.Label>
                    <Form.Control
                        type="number"
                        min="1"
                        isValid={!errors?.vatTax}
                        isInvalid={!!errors?.vatTax}
                        {...register('vatTax')}
                    />
                    <ErrorMessage name='vatTax' errors={errors} />
                </Form.Group>
            </Row>
        </>
    );
}