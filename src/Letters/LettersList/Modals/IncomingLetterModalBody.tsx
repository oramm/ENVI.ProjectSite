import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ErrorMessage, MyAsyncTypeahead } from '../../../View/Modals/CommonFormComponents';
import { LetterModalBody } from './LetterModalBody';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import { IncomingLetter, OurLetter } from '../../../../Typings/bussinesTypes';
import { entitiesRepository } from '../LettersController';

/**Wywoływana w ProjectsSelector jako props  */
export function IncomingLetterModalBody(props: ModalBodyProps<OurLetter | IncomingLetter>) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState: { errors }, control } = useFormContext();

    useEffect(() => {
        setValue('_entitiesMain', initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue('number', initialData?.number || '', { shouldDirty: false, shouldValidate: true });

    }, [initialData, setValue]);

    return (
        <>
            <Form.Group controlId="number">
                <Form.Label>Numer pisma</Form.Label>
                <Form.Control
                    type='text'
                    placeholder="Podaj numer"
                    isInvalid={!!errors?.number}
                    isValid={!errors?.number}
                    {...register('number')}
                />
                <ErrorMessage errors={errors} name={'number'} />
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
                <ErrorMessage errors={errors} name={'_entitiesMain'} />
            </Form.Group>
        </>
    );
}