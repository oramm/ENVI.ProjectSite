import React, { useEffect, useRef, useState } from 'react';
import MainSetup from '../../../React/MainSetupReact';
import { CaseSelectMenuElement, FileInput, MyAsyncTypeahead } from '../../../View/Modals/CommonFormComponents';
import { LetterModalBody, ProjectSelectorModalBody } from './LetterModalBody';
import { casesRepository, entitiesRepository } from '../LettersSearch';
import { useFormContext } from '../../../View/Modals/FormContext';
import { Col, Form, Row } from 'react-bootstrap';
import { ourLetterValidationSchema } from './LetterValidationSchema';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import { Contract, IncomingLetter, OurLetter, Project } from '../../../../Typings/bussinesTypes';

export function OurLetterModalBody(props: ModalBodyProps<OurLetter | IncomingLetter>) {
    const initialData = props.initialData;
    const { reset, trigger, setValue, watch, formState, control } = useFormContext();

    const _contract = watch('_contract') as Contract | undefined;
    const _project = watch('_project') as Project | undefined;

    useEffect(() => {
        setValue('_entitiesMain', initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <LetterModalBody
                {...props}
            />
            <Form.Group>
                <Form.Label>Odbiorca</Form.Label>
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