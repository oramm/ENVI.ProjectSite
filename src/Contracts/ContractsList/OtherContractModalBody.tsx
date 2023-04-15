import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, FormControlProps, Row, Col } from 'react-bootstrap';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import { ContractTypeSelectFormElement, PersonSelectFormElement, MyAsyncTypeahead, handleEditMyAsyncTypeaheadElement, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody';
import { GeneralEditModalButtonProps, GeneralEditModalButton, ModalBodyProps, GeneralAddNewModalButton, GeneralAddNewModalButtonProps, SpecificAddNewModalButtonProps, SpecificEditModalButtonProps, additionalFieldsKeysValue as AdditionalFieldsKeysValue } from '../../View/GeneralModal';
import { contractsRepository, entitiesRepository, projectsRepository } from './ContractsSearch';

/**Wywoływana w ProjectsSelector jako props  */
export function OtherContractModalBody(props: ModalBodyProps & { projectOurId?: string }) {
    const initialData = props.initialData;
    const projectOurId = props.projectOurId || initialData?.projectOurId;
    if (!projectOurId) throw new Error('OtherContractModalBody:: project is not defined');

    const [type, setType] = useState<RepositoryDataItem>(initialData?._type);
    const [selectedContractors, setSelectedContractors] = useState<RepositoryDataItem[]>(initialData?._contractors ? initialData._contractors : []);
    const [selectedOurContracts, setSelectedOurContracts] = useState<RepositoryDataItem[]>(initialData?._ourContract ? [initialData._ourContract] : []);

    const ourRelatedContractsRepository = new RepositoryReact({
        name: 'OurRelatedContractsRepository',
        actionRoutes: { addNewRoute: '', editRoute: '', deleteRoute: '', getRoute: 'contracts' },
    })

    useEffect(() => {
        const additionalFieldsKeysValues = [
            { name: '_type', value: JSON.stringify(type) },
            { name: '_contractors', value: JSON.stringify(selectedContractors) },
            { name: '_ourContract', value: JSON.stringify(selectedOurContracts[0]) }
        ];
        //onAdditionalFieldsKeysValuesChange is defined in ContractModalBody
        if (!props.onAdditionalFieldsKeysValuesChange) throw new Error('OtherContractModalBody:: onAdditionalFieldsKeysValuesChange is not defined');
        props.onAdditionalFieldsKeysValuesChange(additionalFieldsKeysValues);
    }, [selectedContractors, selectedOurContracts, props]);


    return (
        <> {
            (!props.isEditing) ?
                <ContractTypeSelectFormElement
                    typesToInclude='other'
                    selectedRepositoryItems={type ? [type] : []}
                    onChange={(selectedTypes) => {
                        console.log('selectedTypes', selectedTypes);
                        setType(selectedTypes[0])
                    }}
                />
                : null
        }
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
                        { key: 'projectId', value: projectOurId }
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

export function OtherContractEditModalButton({
    modalProps: { onEdit, onIsReadyChange, initialData },
}: SpecificEditModalButtonProps) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OtherContractModalBody,
                onIsReadyChange: onIsReadyChange,
                modalTitle: "Edycja umowy",
                repository: contractsRepository,
                initialData: initialData,
            }}
            buttonProps={{}}
        />
    );
}

export function OtherContractAddNewModalButton({
    modalProps: { onAddNew, onIsReadyChange },
}: SpecificAddNewModalButtonProps) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody, },// additional props for ProjectSelectorModalBody
                onIsReadyChange: onIsReadyChange,
                modalTitle: "Nowa umowa zewnętrzna",
                repository: contractsRepository
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę zewnętrzną",
            }}
        />
    );
}