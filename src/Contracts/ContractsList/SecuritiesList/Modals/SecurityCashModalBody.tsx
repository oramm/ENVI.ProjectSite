import React, { useEffect, useRef, useState } from "react";
import {
    ContractTypeSelectFormElement,
    PersonSelectFormElement,
} from "../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { SecurityModalBody } from "./SecurityModalBody";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import { Security } from "../../../../../Typings/bussinesTypes";

export function SecurityCashModalBody(props: ModalBodyProps<Security>) {
    const { initialData, isEditing } = props;
    const { register, trigger, setValue, watch, formState, control } = useFormContext();
    const _type = watch("_type");

    useEffect(() => {
        setValue("isCash", true);
    }, [initialData, setValue]);

    return (
        <>
            <SecurityModalBody {...props} />
        </>
    );
}
