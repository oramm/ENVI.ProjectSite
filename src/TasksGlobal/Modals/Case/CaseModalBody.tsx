import React, { useEffect, useRef, useState } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { Case, Milestone } from '../../../../Typings/bussinesTypes';
import { CaseTypeSelectFormElement, ErrorMessage } from '../../../View/Modals/CommonFormComponents';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';

export function CaseModalBody({ isEditing, initialData, contextData }: ModalBodyProps<Case>) {
    const { register, reset, getValues, watch, formState: { dirtyFields, errors, isValid }, trigger } = useFormContext();
    const _type = watch('_type');
    const _milestone = (initialData?._milestone || contextData) as Milestone;

    useEffect(() => {
        console.log('CaseModalBody useEffect', initialData);
        const resetData = {
            _milestone,
            _type: initialData?._type,
            name: initialData?.name,
            description: initialData?.description || '',
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    function shoulShowCaseNameField() {
        if (initialData?._type?.isUniquePerMilestone) return false;
        if (_type?.isUniquePerMilestone) return false;
        return true;
    }

    return (
        <>{!isEditing &&
            <CaseTypeSelectFormElement
                milestoneType={_milestone._type}
            />
        }
            {shoulShowCaseNameField() &&
                <Form.Group controlId="name">
                    <Form.Label>Nazwa sprawy</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Podaj nazwę"
                        isInvalid={!!errors?.name}
                        isValid={!errors?.name}
                        {...register('name')}
                    />
                    <ErrorMessage name='name' errors={errors} />
                </Form.Group>
            }
            <Form.Group controlId="description">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Dodaj komentarz"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register('description')}
                />
                <ErrorMessage name='description' errors={errors} />
            </Form.Group>
        </>
    );
}