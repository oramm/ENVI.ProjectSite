import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, FormControlProps, Row, Col } from 'react-bootstrap';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import { ContractTypeSelectFormElement, PersonSelectFormElement, MyAsyncTypeahead, handleEditMyAsyncTypeaheadElement, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { ContractModalBody } from './ContractModalBody';
import { EditModalButtonProps, EditModalButton, ModalBodyProps } from '../../View/GeneralModal';
import { contractsRepository, entitiesRepository } from './ContractsSearch';

export function OtherContractModalBody(props: ModalBodyProps) {
    const initialData = props.initialData;
    const [selectedContractors, setSelectedContractors] = useState<RepositoryDataItem[]>(initialData?._contractors ? initialData._contractors : []);
    const [selectedOurContracts, setSelectedOurContracts] = useState<RepositoryDataItem[]>(initialData?._ourContract ? [initialData._ourContract] : []);

    const ourRelatedContractsRepository = new RepositoryReact({
        name: 'OurRelatedContractsRepository',
        actionRoutes: { addNewRoute: '', editRoute: '', deleteRoute: '', getRoute: 'contracts' },
    })

    useEffect(() => {
        const additionalFieldsKeysValues = [
            { name: '_contractors', value: JSON.stringify(selectedContractors) }
        ];
        if (!props.onAdditionalFieldsKeysValuesChange) throw new Error('onAdditionalFieldsKeysValuesChange is not defined');
        props.onAdditionalFieldsKeysValuesChange(additionalFieldsKeysValues);
    }, [selectedContractors, props]);


    return (
        <>
            <ContractModalBody
                {...props}
            />
            <Form.Group>
                <Form.Label>Wykonawcy</Form.Label>
                <MyAsyncTypeahead
                    labelKey='name'
                    repository={entitiesRepository}
                    onChange={(currentSelectedItems) => handleEditMyAsyncTypeaheadElement(currentSelectedItems, selectedContractors, setSelectedContractors)}
                    selectedRepositoryItems={selectedContractors}
                    multiple={true}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Powiązana usługa IK lub PT</Form.Label>
                <MyAsyncTypeahead
                    labelKey='ourId'
                    searchKey='contractOurId'
                    additionalFieldsKeysValues={[
                        { key: 'projectId', value: props.initialData?.projectOurId }
                    ]}
                    repository={ourRelatedContractsRepository}
                    onChange={(currentSelectedItems) => handleEditMyAsyncTypeaheadElement(currentSelectedItems, selectedOurContracts, setSelectedOurContracts)}
                    selectedRepositoryItems={selectedOurContracts}
                    renderMenuItemChildren={(option: any) => (<div>{option.ourId} {option.name}</div>)}
                />
            </Form.Group>
        </>
    );
}

export function OtherContractEditModalButton({ onEdit, onIsReadyChange, initialData }: Omit<EditModalButtonProps, 'title' | 'repository'>) {
    return (
        <EditModalButton
            onEdit={onEdit}
            ModalBodyComponent={OtherContractModalBody}
            onIsReadyChange={onIsReadyChange}
            title="Edycja umowy"
            repository={contractsRepository}
            initialData={initialData}
        />
    );
}