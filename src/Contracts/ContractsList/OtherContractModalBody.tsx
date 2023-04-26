import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, FormControlProps, Row, Col } from 'react-bootstrap';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import { ContractTypeSelectFormElement, PersonSelectFormElement, MyAsyncTypeahead, handleEditMyAsyncTypeaheadElement, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody';
import { GeneralEditModalButtonProps, GeneralEditModalButton, ModalBodyProps, GeneralAddNewModalButton, GeneralAddNewModalButtonProps, SpecificAddNewModalButtonProps, SpecificEditModalButtonProps, additionalFieldsKeysValue as AdditionalFieldsKeysValue } from '../../View/GeneralModal';
import { contractsRepository, entitiesRepository, projectsRepository } from './ContractsSearch';
import { useFormContext } from '../../View/FormContext';

/**Wywoływana w ProjectsSelector jako props  */
export function OtherContractModalBody(props: ModalBodyProps) {
    const initialData = props.initialData;

    const ourRelatedContractsRepository = new RepositoryReact({
        name: 'OurRelatedContractsRepository',
        actionRoutes: { addNewRoute: '', editRoute: '', deleteRoute: '', getRoute: 'contracts' },
    })

    const { register, setValue, watch, formState, control } = useFormContext();
    const _parent = watch('_parent')[0];
    useEffect(() => {
        setValue('_contractType', initialData?._type || [], { shouldValidate: true });
        setValue('_contractors', initialData?._contractors || [], { shouldValidate: true });
        setValue('_ourContract', initialData?._ourContract ? [initialData._ourContract] : [], { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <> {
            (!props.isEditing) ?
                <ContractTypeSelectFormElement
                    typesToInclude='other'
                    required={true}
                />
                : null
        }
            <ContractModalBody
                {...props}
            />
            <Form.Group>
                <Form.Label>Wykonawcy</Form.Label>
                <MyAsyncTypeahead
                    name='_contractors'
                    labelKey='name'
                    repository={entitiesRepository}
                    multiple={true}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Powiązana usługa IK lub PT</Form.Label>
                <MyAsyncTypeahead
                    name='_ourContract'
                    labelKey='ourId'
                    searchKey='contractOurId'
                    contextSearchParams={[{ key: 'projectId', value: _parent?.ourId }]}
                    repository={ourRelatedContractsRepository}
                    renderMenuItemChildren={(option: any) => (<div>{option.ourId} {option.name}</div>)}
                />
            </Form.Group>
        </>
    );
}

export function OtherContractEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OtherContractModalBody,
                modalTitle: "Edycja umowy",
                repository: contractsRepository,
                initialData: initialData,
            }}
            buttonProps={{}}
        />
    );
}

export function OtherContractAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody, },// additional props for ProjectSelectorModalBody
                modalTitle: "Nowa umowa zewnętrzna",
                repository: contractsRepository
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę zewnętrzną",
            }}
        />
    );
}