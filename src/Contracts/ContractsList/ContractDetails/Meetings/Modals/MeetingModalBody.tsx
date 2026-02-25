import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '../../../../../View/Modals/CommonFormComponents/GenericComponents';
import { MeetingData } from '../../../../../../Typings/bussinesTypes';
import { ModalBodyProps } from '../../../../../View/Modals/ModalsTypes';

export function MeetingModalBody({ isEditing, initialData, contextData }: ModalBodyProps<MeetingData>) {
    const { register, reset, formState: { errors }, trigger } = useFormContext();

    useEffect(() => {
        const resetData = {
            contractId: contextData,
            name: initialData?.name || '',
            date: initialData?.date || new Date().toISOString().slice(0, 10),
            location: initialData?.location || '',
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="name">
                <Form.Label>Nazwa spotkania</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj nazwę spotkania"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register('name')}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>
            <Form.Group controlId="date">
                <Form.Label>Data spotkania</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors?.date}
                    isInvalid={!!errors?.date}
                    {...register('date')}
                />
                <ErrorMessage name="date" errors={errors} />
            </Form.Group>
            <Form.Group controlId="location">
                <Form.Label>Lokalizacja</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="np. Biuro, Teams, Zoom"
                    isValid={!errors?.location}
                    isInvalid={!!errors?.location}
                    {...register('location')}
                />
                <ErrorMessage name="location" errors={errors} />
            </Form.Group>
        </>
    );
}
