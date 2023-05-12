import React, { useEffect, useRef, useState } from 'react';
import MainSetup from '../../../React/MainSetupReact';
import { CaseSelectMenuElement, FileInput, MyAsyncTypeahead } from '../../../View/Modals/CommonFormComponents';
import { LetterModalBody, ProjectSelectorModalBody } from './LetterModalBody';
import { casesRepository, entitiesRepository } from '../LettersSearch';
import { useFormContext } from '../../../View/Modals/FormContext';
import { Col, Form, Row } from 'react-bootstrap';
import { ourLetterValidationSchema } from './LetterValidationSchema';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';

export function OurLetterModalBody(props: ModalBodyProps) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState, control } = useFormContext();

    const _contract = watch('_contract');
    const _project = watch('_project');

    useEffect(() => {
        //setValue('_entitiesMain', initialData?._entitiesMain, { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <h1>OurLetterModalBody</h1>
        </>
    );
}