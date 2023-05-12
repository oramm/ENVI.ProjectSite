import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ContractTypeSelectFormElement, MyAsyncTypeahead } from '../../../View/Modals/CommonFormComponents';
import { LetterModalBody } from './LetterModalBody';
import { entitiesRepository } from '../LettersSearch';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';

/**Wywoływana w ProjectsSelector jako props  */
export function IncomingLetterModalBody(props: ModalBodyProps) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState, control } = useFormContext();

    useEffect(() => {
        setValue('_entitiesMain', initialData?._entitiesMain, { shouldValidate: true });
        setValue('number', initialData?.number || '', { shouldValidate: true });

    }, [initialData, setValue]);

    return (
        <>
            <Form.Group controlId="number">
                <Form.Label>Numer pisma</Form.Label>
                <Form.Control
                    type='text'
                    placeholder="Podaj numer"
                    isInvalid={!!formState.errors?.number}
                    isValid={!formState.errors?.number}
                    {...register('number')}
                />
                {formState.errors?.number && (
                    <Form.Text className="text-danger">
                        {formState.errors.number.message as string}
                    </Form.Text>
                )}
            </Form.Group>
            <LetterModalBody
                {...props}
            />
            <Form.Group>
                <Form.Label>Nadawca</Form.Label>
                <MyAsyncTypeahead
                    name='_entitiesMain'
                    labelKey='name'
                    repository={entitiesRepository}
                    multiple={true}
                />
            </Form.Group>

        </>
    );
}