import React, { useEffect, useRef, useState } from 'react';
import { ContractTypeSelectFormElement, PersonSelectFormElement } from '../../../../View/Modals/CommonFormComponents';
import { SecurityModalBody } from './SecurityModalBody';
import { useFormContext } from '../../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../../View/Modals/ModalsTypes';

export function SecurityCashModalBody(props: ModalBodyProps) {
    const { initialData, isEditing } = props;
    const { register, trigger, setValue, watch, formState, control } = useFormContext();
    const _type = watch('_type');

    useEffect(() => {
        setValue('isCash', true);
    }, [initialData, setValue]);

    return (
        <>
            <SecurityModalBody
                {...props}
            />
        </>
    );
}