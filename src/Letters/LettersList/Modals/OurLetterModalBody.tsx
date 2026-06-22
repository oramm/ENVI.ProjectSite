import React, { useEffect, useRef, useState } from "react";
import {
    EntitySelector,
    OurLetterTemplateSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { LetterModalBody } from "./LetterModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { Col, Form, Row } from "react-bootstrap";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { Case, EntityData, IncomingLetterContract, OurLetterContract } from "../../../../Typings/bussinesTypes";
import { entitiesRepository } from "../LettersController";
import { OurLetterStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import MainSetup from "../../../React/MainSetupReact";
import { EntityInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";

export function OurLetterModalBody(props: ModalBodyProps<OurLetterContract | IncomingLetterContract>) {
    const { initialData, isEditing } = props;
    const {
        setValue,
        watch,
        register,
        formState: { errors },
    } = useFormContext();
    const _cases = watch("_cases") as Case[] | undefined;
    const [showCreateMain, setShowCreateMain] = useState(false);
    const [showCreateCc, setShowCreateCc] = useState(false);

    useEffect(() => {
        const initialStatus = isEditing ? MainSetup.OurLetterStatus.CHANGED : MainSetup.IncomingLetterStatus.REGISTERED;

        setValue("_entitiesMain", initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue("_entitiesCc", initialData?._entitiesCc, { shouldDirty: false, shouldValidate: true });
        setValue("status", initialData?.status || initialStatus, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    function handleMainCreated(created: EntityData) {
        const current = (watch("_entitiesMain") as EntityData[]) || [];
        setValue("_entitiesMain", [...current, created], { shouldValidate: true });
    }

    function handleCcCreated(created: EntityData) {
        const current = (watch("_entitiesCc") as EntityData[]) || [];
        setValue("_entitiesCc", [...current, created], { shouldValidate: true });
    }

    return (
        <>
            <LetterModalBody {...props} />
            <OurLetterStatusSelector />
            {!isEditing && <OurLetterTemplateSelector _cases={_cases || []} />}
            <Form.Group>
                <Form.Label>Odbiorcy</Form.Label>
                <EntitySelector name="_entitiesMain" multiple={true} onRequestCreate={() => setShowCreateMain(true)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Do wiadomości</Form.Label>
                <EntitySelector name="_entitiesCc" multiple={true} onRequestCreate={() => setShowCreateCc(true)} />
            </Form.Group>
            <input type="hidden" {...register("isOur")} value="true" />
            <EntityInlineCreateDrawer
                show={showCreateMain}
                onHide={() => setShowCreateMain(false)}
                title="Nowy podmiot (odbiorca)"
                repository={entitiesRepository}
                onCreated={handleMainCreated}
            />
            <EntityInlineCreateDrawer
                show={showCreateCc}
                onHide={() => setShowCreateCc(false)}
                title="Nowy podmiot (do wiadomości)"
                repository={entitiesRepository}
                onCreated={handleCcCreated}
            />
        </>
    );
}
