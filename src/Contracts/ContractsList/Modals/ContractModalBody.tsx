import React, { useEffect, useRef, useState } from 'react';
import { GeneralDeleteModalButton, GeneralDeleteModalButtonProps, GeneralEditModalButtonProps, ModalBodyProps, SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../../../View/GeneralModal';
import { ContractStatus, ContractTypeSelectFormElement, MyAsyncTypeahead, ProjectSelector, ValueInPLNInput } from '../../../View/Resultsets/CommonComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { OurContractEditModalButton, OurContractModalBody } from './OurContractModalBody';
import { OtherContractEditModalButton, OtherContractModalBody } from './OtherContractModalBody';
import { contractsRepository, projectsRepository } from '../ContractsSearch';
import { RepositoryDataItem } from '../../../React/RepositoryReact';
import { useFormContext } from '../../../View/FormContext';

export function ContractModalBody({ isEditing, initialData }: ModalBodyProps) {
    const { register, setValue, watch, formState, trigger } = useFormContext();

    useEffect(() => {
        setValue('name', initialData?.name || '', { shouldValidate: true });
        setValue('number', initialData?.number || '', { shouldValidate: true });
        setValue('alias', initialData?.alias || '', { shouldValidate: true });
        setValue('comment', initialData?.comment || '', { shouldValidate: true });
        setValue('value', initialData?.value || '', { shouldValidate: true });
        setValue('status', initialData?.status || '', { shouldValidate: true });
        setValue('startDate', initialData?.startDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('endDate', initialData?.endDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <Form.Group controlId="number">
                <Form.Label>Numer kontraktu</Form.Label>
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

            <Form.Group controlId="name">
                <Form.Label>Nazwa kontraktu</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj nazwę"
                    isInvalid={!!formState.errors?.name}
                    isValid={!formState.errors?.name}
                    {...register('name')}
                />
                {formState.errors?.name && (
                    <Form.Text className="text-danger">
                        {formState.errors.name.message as string}
                    </Form.Text>
                )}
            </Form.Group>

            <Form.Group controlId="alias">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj alias"
                    isValid={!formState.errors?.alias}
                    isInvalid={!!formState.errors?.alias}
                    {...register('alias')}
                />
                {formState.errors?.alias && (
                    <Form.Text className="text-danger">
                        {formState.errors.alias.message as string}
                    </Form.Text>
                )}
            </Form.Group>

            <Form.Group controlId="comment">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!formState.errors?.comment}
                    isInvalid={!!formState.errors?.comment}
                    {...register('comment')}
                />
                {
                    formState.errors?.comment && (
                        <Form.Text className="text-danger">
                            {formState.errors.comment.message as string}
                        </Form.Text>
                    )
                }
            </Form.Group>
            <Form.Group controlId="valueInPLN">
                <Form.Label>Wartość netto w PLN</Form.Label>
                <ValueInPLNInput required={true} />
            </Form.Group>
            <Row >
                <Form.Group as={Col} controlId="startDate">
                    <Form.Label>Początek</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!formState.errors.startDate}
                        isInvalid={!!formState.errors.startDate}
                        {...register('startDate')}
                        onChange={(e) => {
                            register("startDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("endDate");
                        }}
                    />
                    {formState.errors.startDate && (
                        <Form.Text className="text-danger">
                            {formState.errors.startDate.message as string}
                        </Form.Text>
                    )}
                </Form.Group>
                <Form.Group as={Col} controlId="endDate">
                    <Form.Label>Zakończenie</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!formState.errors.endDate}
                        isInvalid={!!formState.errors.endDate}
                        {...register('endDate')}
                        onChange={(e) => {
                            register("endDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("startDate");
                        }}
                    />
                    {formState.errors.endDate && (
                        <Form.Text className="text-danger">
                            {formState.errors.endDate.message as string}
                        </Form.Text>
                    )}
                </Form.Group>
            </Row>
            <ContractStatus required={true} />
        </>
    );
}

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * 
 */
export function ProjectSelectorModalBody({ isEditing, additionalProps }: ProjectSelectorProps) {
    const { register, setValue, watch, formState } = useFormContext();
    const project = (watch('_parent') as RepositoryDataItem | undefined);

    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody } = additionalProps;
    if (!SpecificContractModalBody) throw new Error("SpecificContractModalBody is not defined");

    return (
        <>
            {project ? (
                <SpecificContractModalBody
                    isEditing={isEditing}
                    additionalProps={additionalProps}
                />
            ) : (
                <ProjectSelector
                    repository={projectsRepository}
                    required={true}
                />
            )}
        </>
    );
};

/** przycisk i modal edycji OurCOntract lub OtherContract */
export function ContractEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
    isOurContract,
}: SpecificEditModalButtonProps & { isOurContract: boolean }) {

    return (
        isOurContract
            ? <OurContractEditModalButton
                modalProps={{ onEdit, initialData }}
                buttonProps={buttonProps}
            />
            : <OtherContractEditModalButton
                modalProps={{ onEdit, initialData }}
                buttonProps={buttonProps}
            />
    );
}

export function ContractDeleteModalButton({
    modalProps: { onDelete } }: SpecificDeleteModalButtonProps) {
    const currentContract = contractsRepository.currentItems[0];
    const modalTitle = 'Usuwanie kontraktu ' + (currentContract?.ourId || currentContract?._number || '');

    return (
        <GeneralDeleteModalButton
            modalProps={{
                onDelete,
                modalTitle,
                repository: contractsRepository,
                initialData: contractsRepository.currentItems[0],
            }}
        />
    );
}