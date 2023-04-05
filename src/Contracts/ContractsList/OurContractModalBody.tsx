import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, FormControlProps, Row, Col } from 'react-bootstrap';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import MainSetup from '../../React/MainSetupReact';
import { PersonSelectFormElement } from '../../View/Resultsets/CommonComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody';
import { GeneralEditModalButton, ModalBodyProps, SpecificEditModalButtonProps, SpecificAddNewModalButtonProps, GeneralAddNewModalButton } from '../../View/GeneralModal';
import { contractsRepository, projectsRepository } from './ContractsSearch';

export function OurContractModalBody(props: ModalBodyProps & { projectOurId?: string }) {
    const initialData = props.initialData;
    const projectOurId = props.projectOurId || initialData?.projectOurId;
    if (!projectOurId) throw new Error('OtherContractModalBody:: project is not defined');

    const [selectedAdmins, setSelectedAdmins] = useState<RepositoryDataItem[]>(initialData?._admin ? [initialData._admin] : []);
    const [selectedManagers, setSelectedManagers] = useState<RepositoryDataItem[]>(initialData?._manager ? [initialData._manager] : []);



    useEffect(() => {
        const additionalFieldsKeysValues = [
            { name: '_manager', value: JSON.stringify(selectedManagers[0]) },
            { name: '_admin', value: JSON.stringify(selectedAdmins[0]) }
        ];
        if (!props.onAdditionalFieldsKeysValuesChange) throw new Error('OurContractModalBody: onAdditionalFieldsKeysValuesChange is not defined');
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

export function OurContractEditModalButton({
    modalProps: { onEdit, onIsReadyChange, initialData, },
}: SpecificEditModalButtonProps) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurContractModalBody,
                onIsReadyChange: onIsReadyChange,
                modalTitle: "Edycja umowy",
                repository: contractsRepository,
                initialData: initialData,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurContractAddNewModalButton({
    modalProps: { onAddNew, onIsReadyChange },
}: SpecificAddNewModalButtonProps) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                onIsReadyChange: onIsReadyChange,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody },
                modalTitle: "Nowa umowa ENVI",
                repository: contractsRepository,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę ENVI",
                buttonVariant: "outline-success",
            }}
        />
    );
}