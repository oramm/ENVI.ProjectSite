import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { PersonProfileExperienceV2Record } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function ExperienceModalBody({ isEditing, initialData }: ModalBodyProps<PersonProfileExperienceV2Record>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            organizationName: initialData?.organizationName,
            positionName: initialData?.positionName,
            description: initialData?.description,
            dateFrom: initialData?.dateFrom,
            dateTo: initialData?.dateTo,
            isCurrent: initialData?.isCurrent || false,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="organizationName" className="mb-3">
                <Form.Label>Organizacja</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj nazwę organizacji"
                    isInvalid={!!errors?.organizationName}
                    isValid={!errors?.organizationName}
                    {...register("organizationName")}
                />
                <ErrorMessage name="organizationName" errors={errors} />
            </Form.Group>

            <Form.Group controlId="positionName" className="mb-3">
                <Form.Label>Stanowisko</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj stanowisko"
                    isInvalid={!!errors?.positionName}
                    isValid={!errors?.positionName}
                    {...register("positionName")}
                />
                <ErrorMessage name="positionName" errors={errors} />
            </Form.Group>

            <Form.Group controlId="description" className="mb-3">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Opis obowiązków"
                    isInvalid={!!errors?.description}
                    isValid={!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>

            <Form.Group controlId="dateFrom" className="mb-3">
                <Form.Label>Data od</Form.Label>
                <Form.Control type="date" {...register("dateFrom")} />
            </Form.Group>

            <Form.Group controlId="dateTo" className="mb-3">
                <Form.Label>Data do</Form.Label>
                <Form.Control type="date" {...register("dateTo")} />
            </Form.Group>

            <Form.Group controlId="isCurrent" className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Obecne miejsce pracy"
                    {...register("isCurrent")}
                />
            </Form.Group>
        </>
    );
}
