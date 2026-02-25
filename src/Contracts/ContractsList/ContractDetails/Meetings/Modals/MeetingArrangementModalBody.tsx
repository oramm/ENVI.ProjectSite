import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from '../../../../../View/Modals/FormContext';
import { ErrorMessage } from '../../../../../View/Modals/CommonFormComponents/GenericComponents';
import { Case, MeetingArrangementData } from '../../../../../../Typings/bussinesTypes';
import { ModalBodyProps } from '../../../../../View/Modals/ModalsTypes';
import { CaseSelectMenuElement } from '../../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors';
import RepositoryReact from '../../../../../React/RepositoryReact';
import { useContractDetails } from '../../ContractDetailsContext';

const caseSelectorRepository = new RepositoryReact<Case>({
    actionRoutes: {
        getRoute: 'cases',
        addNewRoute: 'case',
        editRoute: 'case',
        deleteRoute: 'case',
    },
    name: 'cases_meetingArrangement_temp',
});

export function MeetingArrangementModalBody({
    isEditing,
    initialData,
    contextData,
}: ModalBodyProps<MeetingArrangementData>) {
    const { contract } = useContractDetails();
    const { register, reset, formState: { errors }, trigger } = useFormContext();

    useEffect(() => {
        const resetData = {
            meetingId: contextData,
            _case: initialData?._case || undefined,
            description: initialData?.description || '',
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="_case">
                <Form.Label>Sprawa</Form.Label>
                <CaseSelectMenuElement
                    repository={caseSelectorRepository}
                    _contract={contract as any}
                    multiple={false}
                    name="_case"
                />
                <ErrorMessage name="_case" errors={errors} />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Opis (opcjonalny)</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Dodatkowy opis punktu agendy"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register('description')}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
        </>
    );
}
