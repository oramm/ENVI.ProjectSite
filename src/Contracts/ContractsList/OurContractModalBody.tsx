import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, FormControlProps, Row, Col } from 'react-bootstrap';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import MainSetup from '../../React/MainSetupReact';
import { ContractTypeSelectFormElement, PersonSelectFormElement, MyAsyncTypeahead, handleEditMyAsyncTypeaheadElement, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { ContractModalBody } from './ContractModalBody';
import { EditModalButtonProps, EditModalButton, ModalBodyProps } from '../../View/GeneralModal';
import { contractsRepository } from './ContractsSearch';

export function OurContractModalBody(props: ModalBodyProps) {
    const initialData = props.initialData;
    const [selectedAdmins, setSelectedAdmins] = useState<RepositoryDataItem[]>(initialData?._admin ? [initialData._admin] : []);
    const [selectedManagers, setSelectedManagers] = useState<RepositoryDataItem[]>(initialData?._manager ? [initialData._manager] : []);

    useEffect(() => {
        const additionalFieldsKeysValues = [
            { name: '_manager', value: JSON.stringify(selectedManagers[0]) },
            { name: '_admin', value: JSON.stringify(selectedAdmins[0]) }
        ];
        if (!props.onAdditionalFieldsKeysValuesChange) throw new Error('onAdditionalFieldsKeysValuesChange is not defined');
        props.onAdditionalFieldsKeysValuesChange(additionalFieldsKeysValues);
    }, [selectedAdmins, selectedManagers, props]);
    return (
        <>
            <ContractModalBody
                {...props}

            />
            <Form.Group controlId="manager">
                <PersonSelectFormElement
                    label='Koordynator'
                    selectedRepositoryItems={selectedManagers}
                    onChange={(currentSelectedItems) => {
                        setSelectedManagers(currentSelectedItems);
                    }}
                    repository={MainSetup.personsEnviRepository}
                />
            </Form.Group>

            <Form.Group controlId="admin">
                <PersonSelectFormElement
                    label='Administrator'
                    selectedRepositoryItems={selectedAdmins}
                    onChange={setSelectedAdmins}
                    repository={MainSetup.personsEnviRepository}
                />
            </Form.Group>
        </>
    );
}

export function OurContractEditModalButton({ onEdit, onIsReadyChange, initialData }: Omit<EditModalButtonProps, 'title' | 'repository'>) {
    return (
        <EditModalButton
            onEdit={onEdit}
            ModalBodyComponent={OurContractModalBody}
            onIsReadyChange={onIsReadyChange}
            title="Edycja umowy"
            repository={contractsRepository}
            initialData={initialData}
        />
    );
}