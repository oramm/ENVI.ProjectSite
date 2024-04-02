import React, { useEffect } from "react";
import { ErrorMessage, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { NeedData } from "../../../../Typings/bussinesTypes";
import { clientsRepository } from "../../FinancialAidProgrammesController";

export function NeedModalBody({ isEditing, initialData }: ModalBodyProps<NeedData>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData = {
            _client: initialData?._client,
            name: initialData?.name,
            description: initialData?.description,
            status: initialData?.status,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);

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
            <Form.Group controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" isInvalid={!!errors?.status} {...register("status")}>
                    <option value="">Wybierz status</option>
                    <option value="active">Aktywny</option>
                    <option value="pending">Oczekujący</option>
                    <option value="completed">Zakończony</option>
                    <option value="cancelled">Anulowany</option>
                </Form.Control>
                <ErrorMessage name="status" errors={errors} />
            </Form.Group>
        </>
    );
}
