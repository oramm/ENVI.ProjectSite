import React, { useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import { InvoiceItem } from '../../../../Typings/bussinesTypes';

export function InvoiceItemModalBody({ isEditing, initialData }: ModalBodyProps<InvoiceItem>) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = useFormContext();

    useEffect(() => {
        console.log('InvoiceModalBody useEffect', initialData);
        const resetData = {
            description: initialData?.description || '',
            quantity: initialData?.quantity || 1,
            unitPrice: initialData?.unitPrice,
            vatTax: initialData?.vatTax || 23,
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
                <Form.Group as={Col} controlId="quantity" className="align-items-center d-flex">
                    <Form.Label>Ilość</Form.Label>
                    <Form.Control
                        type="number"
                        min="1"
                        style={{ width: '5rem' }}
                        {...register('quantity')}
                    />
                    <ErrorMessage name='quantity' errors={errors} />
                </Form.Group>
                <Form.Group as={Col} controlId="unitPrice">
                    <Form.Label>Cena jedn.</Form.Label>
                    <Form.Control
                        type="number"
                        min="1"
                        {...register('unitPrice')}
                    />
                    <ErrorMessage name='unitPrice' errors={errors} />
                </Form.Group>
                <Form.Group as={Col} controlId="vatTax">
                    <Form.Label>Stawka VAT</Form.Label>
                    <Form.Control
                        type="number"
                        min="1"
                        {...register('vatTax')}
                    />
                    <ErrorMessage name='vatTax' errors={errors} />
                </Form.Group>
            </Row>
        </>
    );
}