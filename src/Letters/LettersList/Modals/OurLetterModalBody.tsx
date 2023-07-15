import React, { useEffect, useRef, useState } from 'react';
import { ErrorMessage, MyAsyncTypeahead, OurLetterTemplateSelectFormElement } from '../../../View/Modals/CommonFormComponents';
import { LetterModalBody } from './LetterModalBody';
import { useFormContext } from '../../../View/Modals/FormContext';
import { Col, Form, Row } from 'react-bootstrap';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import { Case, Contract, IncomingLetter, OurLetter, Project } from '../../../../Typings/bussinesTypes';
import { entitiesRepository } from '../LettersController';

export function OurLetterModalBody(props: ModalBodyProps<OurLetter | IncomingLetter>) {
    const { initialData, isEditing } = props;
    const { setValue, watch, register, formState: { errors } } = useFormContext();
    const _cases = watch('_cases') as Case[] | undefined;

    useEffect(() => {
        setValue('_entitiesMain', initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <LetterModalBody
                {...props}
            />
            {!isEditing &&
                <OurLetterTemplateSelectFormElement
                    _cases={_cases || []}
                />
            }
            <Form.Group>
                <Form.Label>Odbiorca</Form.Label>
                <MyAsyncTypeahead
                    name='_entitiesMain'
                    labelKey='name'
                    repository={entitiesRepository}
                    multiple={true}
                />
                <ErrorMessage errors={errors} name='_entitiesMain' />
            </Form.Group>
            <input type="hidden" {...register('isOur')} value='true' />
        </>
    );
}