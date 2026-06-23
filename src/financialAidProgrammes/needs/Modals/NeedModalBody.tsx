import React, { useEffect, useState } from "react";
import {
    ApplicationCallSelector,
    EntitySelector,
    FocusAreaSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { FocusAreaData, NeedData } from "../../../../Typings/bussinesTypes";
import { clientsRepository } from "../../FinancialAidProgrammesController";
import { applicationCallsRepository } from "../../FocusAreas/ApplicationCalls/ApplicationCallsController";
import { ClientNeedStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { EntityInlineCreateDrawer, FocusAreaInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";

export function NeedModalBody({ isEditing, initialData }: ModalBodyProps<NeedData>) {
    const {
        register,
        reset,
        setValue,
        formState: { errors },
        trigger,
        watch,
    } = useFormContext();

    useEffect(() => {
        const resetData = {
            _client: initialData?._client,
            name: initialData?.name,
            description: initialData?.description,
            status: initialData?.status,
            _focusAreas: initialData?._focusAreas,
            _applicationCall: initialData?._applicationCall || null,
        } as NeedData;
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);

    useEffect(() => {
        console.log("Application call changed", watch("_applicationCall"));
    }, [watch("_applicationCall")]);

    const _focusAreas = watch("_focusAreas") as FocusAreaData[] | undefined;
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [showCreateFocusArea, setShowCreateFocusArea] = useState(false);

    function handleFocusAreaCreated(created: FocusAreaData) {
        const current = (_focusAreas) || [];
        setValue("_focusAreas", [...current, created], { shouldValidate: true });
    }

    return (
        <>
            <Form.Group>
                <Form.Label>Klient</Form.Label>
                <EntitySelector
                    name="_client"
                    repository={clientsRepository}
                    multiple={false}
                    showValidationInfo={true}
                    onRequestCreate={() => setShowCreateClient(true)}
                />
            </Form.Group>
            <Form.Group controlId="name">
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj nazwę"
                    isValid={!errors?.name}
                    isInvalid={!!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
            <ClientNeedStatusSelector />
            <Form.Group controlId="_focusAreas">
                <Form.Label>Przypisz działania</Form.Label>
                <FocusAreaSelector name="_focusAreas" multiple={true} onRequestCreate={() => setShowCreateFocusArea(true)} />
            </Form.Group>
            {_focusAreas && (
                <Form.Group controlId="_applicationCall">
                    <Form.Label>Wybierz nabor</Form.Label>
                    <ApplicationCallSelector name="_applicationCall" multiple={false} _focusArea={_focusAreas} />
                </Form.Group>
            )}
            <EntityInlineCreateDrawer
                show={showCreateClient}
                onHide={() => setShowCreateClient(false)}
                title="Nowy klient"
                repository={clientsRepository}
                onCreated={(created) => setValue("_client", created, { shouldValidate: true })}
            />
            <FocusAreaInlineCreateDrawer
                show={showCreateFocusArea}
                onHide={() => setShowCreateFocusArea(false)}
                title="Nowe działanie"
                onCreated={handleFocusAreaCreated}
            />
        </>
    );
}
