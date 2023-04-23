import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, FormControlProps, Row, Col } from 'react-bootstrap';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import MainSetup from '../../React/MainSetupReact';
import { ContractTypeSelectFormElement, FileInput, PersonSelectFormElement } from '../../View/Resultsets/CommonComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody-TEST';
import { GeneralEditModalButton, ModalBodyProps, SpecificEditModalButtonProps, SpecificAddNewModalButtonProps, GeneralAddNewModalButton } from '../../View/GeneralModal';
import { contractsRepository, projectsRepository } from './ContractsSearch';
import { useValidation } from '../../View/useValidation';
import { useFormContext } from '../../View/FormContext';

export function OurContractModalBody(props: ModalBodyProps & { projectOurId?: string }) {
    const initialData = props.initialData;
    const projectOurId = props.projectOurId || initialData?.projectOurId;
    if (!projectOurId) throw new Error('OtherContractModalBody:: project is not defined');
    const { register, setValue, watch, formState, control } = useFormContext();

    useEffect(() => {
        setValue('contractType', initialData?.type || [], { shouldValidate: true });
        // Ustaw inne wartości domyślne dla pozostałych pól formularza
        setValue('admin', initialData?._admin ? [initialData._admin] : [], { shouldValidate: true });
        setValue('manager', initialData?._manager ? [initialData._manager] : [], { shouldValidate: true });
    }, [initialData, setValue]);


    const [selectedAdmins, setSelectedAdmins] = useState<RepositoryDataItem[]>(initialData?._admin ? [initialData._admin] : []);
    const [selectedManagers, setSelectedManagers] = useState<RepositoryDataItem[]>(initialData?._manager ? [initialData._manager] : []);

    //pozostałe pola admin i managaer
    const managerValidation = useValidation<RepositoryDataItem[]>({
        initialValue: initialData?._manager ? [initialData._manager] : [],
        validationFunction: (value) => value?.length > 0,
        fieldName: 'manager',
        validationMessage: 'Musisz wybrać koordynatora',
        onValidationChange: props.onValidationChange,
    });

    const adminValidation = useValidation<RepositoryDataItem[]>({
        initialValue: initialData?._admin ? [initialData._admin] : [],
        validationFunction: (value) => value?.length > 0,
        fieldName: 'admin',
        validationMessage: 'Musisz wybrać administratora',
        onValidationChange: props.onValidationChange,
    });

    useEffect(() => {
        const additionalFieldsKeysValues = [
            { name: '_manager', value: JSON.stringify(managerValidation.value[0]) },
            { name: '_admin', value: JSON.stringify(adminValidation.value[0]) }
        ];
        if (!props.onAdditionalFieldsKeysValuesChange) throw new Error('OurContractModalBody: onAdditionalFieldsKeysValuesChange is not defined');
        props.onAdditionalFieldsKeysValuesChange(additionalFieldsKeysValues);
    }, [selectedAdmins, selectedManagers, props.onAdditionalFieldsKeysValuesChange]);

    return (
        <>
            {
                (!props.isEditing) ?
                    <ContractTypeSelectFormElement
                        typesToInclude='our'
                        required={true}
                    />
                    : null
            }
            <ContractModalBody
                {...props}
            />
            <Form.Group controlId="manager">
                <PersonSelectFormElement
                    label='Koordynator'
                    selectedRepositoryItems={managerValidation.value ? managerValidation.value : []}
                    onChange={managerValidation.handleChange}
                    repository={MainSetup.personsEnviRepository}
                    isInvalid={!managerValidation.isValid}
                    isValid={managerValidation.isValid}
                />
                {!managerValidation.isValid &&
                    <Form.Text className="text-danger">
                        {managerValidation.validationMessage}
                    </Form.Text>
                }
            </Form.Group>

            <Form.Group controlId="admin">
                <PersonSelectFormElement
                    label='Administrator'
                    selectedRepositoryItems={adminValidation.value ? adminValidation.value : []}
                    onChange={adminValidation.handleChange}
                    repository={MainSetup.personsEnviRepository}
                    isInvalid={!adminValidation.isValid}
                    isValid={adminValidation.isValid}
                />
                {!adminValidation.isValid &&
                    <Form.Text className="text-danger">
                        {adminValidation.validationMessage}
                    </Form.Text>
                }
            </Form.Group>
            <FileInput
                fieldName="exampleFile"
                acceptedFileTypes="application/msword, application/vnd.ms-excel, application/pdf"
            />
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