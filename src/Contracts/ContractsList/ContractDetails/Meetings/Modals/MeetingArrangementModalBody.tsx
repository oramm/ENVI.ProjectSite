import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from '../../../../../View/Modals/FormContext';
import { ErrorMessage } from '../../../../../View/Modals/CommonFormComponents/GenericComponents';
import { Case, MeetingArrangementData } from '../../../../../../Typings/bussinesTypes';
import { ModalBodyProps } from '../../../../../View/Modals/ModalsTypes';
import { CaseSelectMenuElement } from '../../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors';
import RepositoryReact from '../../../../../React/RepositoryReact';
import { useContractDetails } from '../../ContractDetailsContext';
import { InlineCreateDrawer } from '../../../../../View/Modals/InlineCreateDrawer';
import {
    CaseInlineCreateBody,
    makeInlineCaseValidationSchema,
} from '../../../../../TasksGlobal/Modals/Case/CaseInlineCreateBody';
import { buildContractHeaderBadge } from '../../../../../TasksGlobal/Modals/Case/CaseModalButtons';

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
    const { register, reset, setValue, formState: { errors }, trigger } = useFormContext();

    // Panel inline-tworzenia Sprawy (Offcanvas) + token wymuszający odświeżenie opcji
    // selektora ze źródła prawdy (caseSelectorRepository.items) po utworzeniu sprawy.
    const [showCreateCase, setShowCreateCase] = useState(false);
    const [caseOptionsRefreshToken, setCaseOptionsRefreshToken] = useState(0);

    useEffect(() => {
        const resetData = {
            meetingId: contextData,
            _case: initialData?._case || undefined,
            description: initialData?.description || '',
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    // Po utworzeniu sprawy w panelu: addNewItem dopisał ją już do caseSelectorRepository.items
    // (źródło prawdy). Auto-zaznaczamy ją w polu `_case` (single-select) i podbijamy token,
    // by selektor przebudował opcje z repository.items.
    function handleCaseCreated(newCase: Case) {
        const created = caseSelectorRepository.items.find((item) => item.id === newCase.id) ?? newCase;
        setValue('_case', created, { shouldValidate: true });
        setCaseOptionsRefreshToken((token) => token + 1);
    }

    return (
        <>
            <Form.Group controlId="_case">
                <Form.Label>Sprawa</Form.Label>
                <CaseSelectMenuElement
                    repository={caseSelectorRepository}
                    _contract={contract as any}
                    multiple={false}
                    name="_case"
                    onRequestCreate={() => setShowCreateCase(true)}
                    refreshToken={caseOptionsRefreshToken}
                />
                <ErrorMessage name="_case" errors={errors} />
            </Form.Group>

            {/* Panel boczny tworzenia Sprawy "w miejscu" — ta SAMA instancja caseSelectorRepository
                co selektor, więc utworzona sprawa odświeża jego opcje. */}
            <InlineCreateDrawer<Case>
                show={showCreateCase}
                onHide={() => setShowCreateCase(false)}
                title="Nowa sprawa"
                headerBadge={buildContractHeaderBadge(contract as any)}
                repository={caseSelectorRepository}
                ModalBodyComponent={CaseInlineCreateBody}
                additionalModalBodyProps={{ _contract: contract }}
                makeValidationSchema={makeInlineCaseValidationSchema}
                onCreated={handleCaseCreated}
            />

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
