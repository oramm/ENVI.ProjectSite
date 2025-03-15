import React, { useEffect, useRef, useState } from "react";
import {
    EntitySelector,
    OurLetterTemplateSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { LetterModalBody } from "./LetterModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { Col, Form, Row } from "react-bootstrap";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { Case, IncomingLetterContract, OurLetterContract } from "../../../../Typings/bussinesTypes";
import { entitiesRepository } from "../LettersController";
import { ErrorMessage, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { OurLetterStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import MainSetup from "../../../React/MainSetupReact";

export function OurLetterModalBody(props: ModalBodyProps<OurLetterContract | IncomingLetterContract>) {
    const { initialData, isEditing } = props;
    const {
        setValue,
        watch,
        register,
        formState: { errors },
    } = useFormContext();
    const _cases = watch("_cases") as Case[] | undefined;

    useEffect(() => {
        const initialStatus = isEditing ? MainSetup.OurLetterStatus.CHANGED : MainSetup.IncomingLetterStatus.REGISTERED;

        setValue("_entitiesMain", initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue("_entitiesCc", initialData?._entitiesCc, { shouldDirty: false, shouldValidate: true });
        setValue("status", initialData?.status || initialStatus, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <LetterModalBody {...props} />
            <OurLetterStatusSelector />
            {!isEditing && <OurLetterTemplateSelector _cases={_cases || []} />}
            <Form.Group>
                <Form.Label>Odbiorcy</Form.Label>
                <EntitySelector name="_entitiesMain" repository={entitiesRepository} multiple={true} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Do wiadomości</Form.Label>
                <EntitySelector name="_entitiesCc" repository={entitiesRepository} multiple={true} />
            </Form.Group>
            <input type="hidden" {...register("isOur")} value="true" />
        </>
    );
}
