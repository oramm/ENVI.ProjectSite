import React, { useEffect } from 'react';
import { ErrorMessage } from '../../../View/Modals/CommonFormComponents';
import { Form } from 'react-bootstrap';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import { Invoice } from '../../../../Typings/bussinesTypes';

export function InvoiceSetAsSentModalBody({ initialData }: ModalBodyProps<Invoice>) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = useFormContext();

    useEffect(() => {
        console.log('InvoiceModalBody useEffect', initialData);
        const resetData = {
            sentDate: initialData?.sentDate || new Date().toISOString().slice(0, 10),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);


    return (
        <>
            <Form.Group controlId="sentDate">
                <Form.Label>Data nadania</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.sentDate}
                    isInvalid={!!errors.sentDate}
                    {...register('sentDate')}
                />
                <ErrorMessage name='sentDate' errors={errors} />
            </Form.Group>
        </>
    );
}