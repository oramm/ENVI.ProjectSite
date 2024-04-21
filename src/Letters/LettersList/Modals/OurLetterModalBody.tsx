import React, { useEffect, useRef, useState } from "react";
import { OurLetterTemplateSelectFormElement } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { LetterModalBody } from "./LetterModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { Col, Form, Row } from "react-bootstrap";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { Case, IncomingLetterContract, OurLetterContract } from "../../../../Typings/bussinesTypes";
import { entitiesRepository } from "../LettersController";
import { ErrorMessage, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents/GenericComponents";

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
        setValue("_entitiesMain", initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue("_entitiesCc", initialData?._entitiesCc, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <LetterModalBody {...props} />
            {!isEditing && <OurLetterTemplateSelectFormElement _cases={_cases || []} />}
            <Form.Group>
                <Form.Label>Odbiorcy</Form.Label>
                <MyAsyncTypeahead
                    name="_entitiesMain"
                    labelKey="name"
                    repository={entitiesRepository}
                    multiple={true}
                />
                <ErrorMessage errors={errors} name="_entitiesMain" />
            </Form.Group>
            <Form.Group>
                <Form.Label>Do wiadomości</Form.Label>
                <MyAsyncTypeahead name="_entitiesCc" labelKey="name" repository={entitiesRepository} multiple={true} />
                <ErrorMessage errors={errors} name="_entitiesCc" />
            </Form.Group>
            <input type="hidden" {...register("isOur")} value="true" />
        </>
    );
}
