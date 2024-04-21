import React, { useEffect, useRef, useState } from "react";
import { Alert, Col, Form, Row } from "react-bootstrap";
import { Project } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { ErrorMessage, ValueInPLNInput } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { ProjectStatusSelectFormElement } from "../../View/Modals/CommonFormComponents/StatusSelectors";

export function ProjectModalBody({ isEditing, initialData }: ModalBodyProps<Project>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();
    useEffect(() => {
        const resetData = {
            name: initialData?.name,
            alias: initialData?.alias,
            comment: initialData?.comment,
            startDate: initialData?.startDate || new Date().toISOString().slice(0, 10),
            endDate: initialData?.endDate || new Date().toISOString().slice(0, 10),
            status: initialData?.status || MainSetup.ProjectStatuses.IN_PROGRESS,
            totalValue: initialData?.totalValue,
            qualifiedValue: initialData?.qualifiedValue,
            dotationValue: initialData?.dotationValue,
            ourId: initialData?.ourId,
            _employers: initialData?._employers,
            _engineers: initialData?._engineers,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="ourId">
                <Form.Label>Oznaczenie Projektu</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj numer"
                    isInvalid={!!errors?.ourId}
                    isValid={!errors?.ourId}
                    {...register("ourId")}
                />
                <ErrorMessage errors={errors} name="ourId" />
            </Form.Group>

            <Form.Group controlId="name">
                <Form.Label>Nazwa projektu</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj nazwę"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage errors={errors} name="name" />
            </Form.Group>

            <Form.Group controlId="alias">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj alias"
                    isValid={!errors?.alias}
                    isInvalid={!!errors?.alias}
                    {...register("alias")}
                />
                <ErrorMessage errors={errors} name="alias" />
            </Form.Group>

            <Form.Group controlId="comment">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!errors?.comment}
                    isInvalid={!!errors?.comment}
                    {...register("comment")}
                />
                <ErrorMessage errors={errors} name="comment" />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="totalValue">
                    <Form.Label>Wartość całkowita</Form.Label>
                    <ValueInPLNInput keyLabel="totalValue" />
                </Form.Group>
                <Form.Group as={Col} controlId="qualifiedValue">
                    <Form.Label>Wartość kwalifikowana</Form.Label>
                    <ValueInPLNInput keyLabel="qualifiedValue" />
                </Form.Group>
                <Form.Group as={Col} controlId="dotationValue">
                    <Form.Label>Wartość dofinansowania</Form.Label>
                    <ValueInPLNInput keyLabel="dotationValue" />
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} controlId="startDate">
                    <Form.Label>Początek</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.startDate}
                        isInvalid={!!errors.startDate}
                        {...register("startDate")}
                        onChange={(e) => {
                            register("startDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("endDate");
                        }}
                    />
                    <ErrorMessage errors={errors} name="startDate" />
                </Form.Group>
                <Form.Group as={Col} controlId="endDate">
                    <Form.Label>Zakończenie</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.endDate}
                        isInvalid={!!errors.endDate}
                        {...register("endDate")}
                        onChange={(e) => {
                            register("endDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("startDate");
                        }}
                    />
                    <ErrorMessage errors={errors} name="endDate" />
                </Form.Group>
            </Row>
            <ProjectStatusSelectFormElement />
        </>
    );
}
