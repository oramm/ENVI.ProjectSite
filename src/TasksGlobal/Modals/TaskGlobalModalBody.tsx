import React, { useEffect, useRef, useState } from "react";
import { Alert, Col, Form, Row } from "react-bootstrap";
import { Task } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import { PersonSelectorPreloaded } from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { TaksStatusSelector } from "../../View/Modals/CommonFormComponents/StatusSelectors";
import { ErrorMessage } from "../../View/Modals/CommonFormComponents/GenericComponents";

export function TaskGlobalModalBody({ isEditing, initialData, contextData: contextData }: ModalBodyProps<Task>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();
    const _case = initialData?._parent || contextData;

    useEffect(() => {
        console.log("TaskModalBody useEffect", initialData);
        const resetData = {
            _case,
            name: initialData?.name,
            description: initialData?.description || "",
            deadline: initialData?.deadline || new Date().toISOString().slice(0, 10),
            status: initialData?.status || MainSetup.TaskStatus.BACKLOG,
            _owner: initialData?._owner || MainSetup.getCurrentUserAsPerson(),
            estimatedHours: initialData?.estimatedHours ?? "",
            hoursMon: initialData?.hoursMon ?? "",
            hoursTue: initialData?.hoursTue ?? "",
            hoursWed: initialData?.hoursWed ?? "",
            hoursThu: initialData?.hoursThu ?? "",
            hoursFri: initialData?.hoursFri ?? "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="name">
                <Form.Label>Nazwa zadania</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj nazwę"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Dodaj komentarz"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
            <Form.Group controlId="deadline">
                <Form.Label>Termin</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.deadline}
                    isInvalid={!!errors.deadline}
                    {...register("deadline")}
                />
                <ErrorMessage name="deadline" errors={errors} />
            </Form.Group>
            <TaksStatusSelector />
            <Form.Group controlId="_owner">
                <PersonSelectorPreloaded
                    label="Właściciel"
                    name="_owner"
                    repository={MainSetup.personsEnviRepository}
                />
            </Form.Group>
            <Form.Group controlId="estimatedHours" className="mt-2">
                <Form.Label>Szacowany czas [h]</Form.Label>
                <Form.Control
                    type="number"
                    min={0}
                    step={0.5}
                    {...register("estimatedHours", { setValueAs: toNullableNumber })}
                />
            </Form.Group>
            <Form.Group className="mt-2">
                <Form.Label>Czas rzeczywisty [h] (PO / WT / ŚR / CZ / PT)</Form.Label>
                <div className="d-flex gap-2">
                    {(["hoursMon", "hoursTue", "hoursWed", "hoursThu", "hoursFri"] as const).map((field, i) => (
                        <Form.Control
                            key={field}
                            type="number"
                            min={0}
                            step={0.5}
                            placeholder={["PO", "WT", "ŚR", "CZ", "PT"][i]}
                            {...register(field, { setValueAs: toNullableNumber })}
                        />
                    ))}
                </div>
            </Form.Group>
        </>
    );
}

/** Puste pole → null (czyści wartość), inaczej liczba. */
function toNullableNumber(v: unknown): number | null {
    return v === "" || v === null || v === undefined ? null : Number(v);
}
