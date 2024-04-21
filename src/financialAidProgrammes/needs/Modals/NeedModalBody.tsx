import React, { useEffect } from "react";
import {
    ApplicationCallSelector,
    FocusAreaSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { FocusAreaData, NeedData } from "../../../../Typings/bussinesTypes";
import { clientsRepository } from "../../FinancialAidProgrammesController";
import { focusAreasRepository } from "../../FocusAreas/FocusAreasController";
import { applicationCallsRepository } from "../../FocusAreas/ApplicationCalls/ApplicationCallsController";
import { ClientNeedStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import { ErrorMessage, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function NeedModalBody({ isEditing, initialData }: ModalBodyProps<NeedData>) {
    const {
        register,
        reset,
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
            _applicationCall: initialData?._applicationCall,
        } as NeedData;
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);

    const _focusAreas = watch("_focusAreas") as FocusAreaData[] | undefined;

    return (
        <>
            <Form.Group>
                <Form.Label>Klient</Form.Label>
                <MyAsyncTypeahead
                    name="_client"
                    labelKey="name"
                    repository={clientsRepository}
                    multiple={false}
                    showValidationInfo={true}
                />
                <ErrorMessage errors={errors} name={"_client"} />
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
                <Form.Label>Przypisz obszary działania</Form.Label>
                <FocusAreaSelector name="_focusAreas" repository={focusAreasRepository} multiple={true} />
            </Form.Group>
            {_focusAreas && (
                <Form.Group controlId="_applicationCalls">
                    <Form.Label>Wybierz nabor</Form.Label>
                    <ApplicationCallSelector
                        name="_applicationCalls"
                        repository={applicationCallsRepository}
                        multiple={true}
                        _focusArea={_focusAreas}
                    />
                </Form.Group>
            )}
        </>
    );
}
