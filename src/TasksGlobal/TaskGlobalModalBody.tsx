import React, { useEffect, useRef, useState } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { Task } from '../../Typings/bussinesTypes';
import { TaskModalBody } from '../Contracts/ContractsList/ContractDetails/Tasks/Modals/TaskModalBody';
import MainSetup from '../React/MainSetupReact';
import { CaseSelectMenuElement, ContractSelectFormElement, ErrorMessage, PersonSelectFormElement, TaksStatusSelectFormElement } from '../View/Modals/CommonFormComponents';
import { useFormContext } from '../View/Modals/FormContext';
import { ModalBodyProps } from '../View/Modals/ModalsTypes';
import { casesRepository, contractsRepository } from './TasksGlobalController';

export function TaskGlobalModalBody({ isEditing, initialData }: ModalBodyProps<Task>) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = useFormContext();
    const _contract = watch('_contract');
    const _case = watch('_case');

    useEffect(() => {
        console.log('TaskModalBody useEffect', initialData);
        const resetData = {
            _contract: initialData?._contract,
            name: initialData?.name,
            description: initialData?.description || '',
            deadline: initialData?.deadline || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            status: initialData?.status || MainSetup.taskStatusNames[1],
            _owner: initialData?._owner || MainSetup.getCurrentUserAsPerson(),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);


    return (
        <>

            {!isEditing &&
                <>

                </>
            }
            <TaskModalBody isEditing={isEditing} initialData={initialData} />
        </>
    );
}