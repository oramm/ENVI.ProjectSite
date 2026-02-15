import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { PersonProfileEducationV2Record } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function EducationModalBody({ isEditing, initialData }: ModalBodyProps<PersonProfileEducationV2Record>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            schoolName: initialData?.schoolName,
            degreeName: initialData?.degreeName,
            fieldOfStudy: initialData?.fieldOfStudy,
            dateFrom: initialData?.dateFrom,
            dateTo: initialData?.dateTo,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="schoolName" className="mb-3">
                <Form.Label>Nazwa szkoły/uczelni</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj nazwę"
                    isInvalid={!!errors?.schoolName}
                    isValid={!errors?.schoolName}
                    {...register("schoolName")}
                />
                <ErrorMessage name="schoolName" errors={errors} />
            </Form.Group>

            <Form.Group controlId="degreeName" className="mb-3">
                <Form.Label>Tytuł/stopień</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="np. magister, inżynier"
                    isInvalid={!!errors?.degreeName}
                    isValid={!errors?.degreeName}
                    {...register("degreeName")}
                />
                <ErrorMessage name="degreeName" errors={errors} />
            </Form.Group>

            <Form.Group controlId="fieldOfStudy" className="mb-3">
                <Form.Label>Kierunek</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="np. Informatyka"
                    isInvalid={!!errors?.fieldOfStudy}
                    isValid={!errors?.fieldOfStudy}
                    {...register("fieldOfStudy")}
                />
                <ErrorMessage name="fieldOfStudy" errors={errors} />
            </Form.Group>

            <Form.Group controlId="dateFrom" className="mb-3">
                <Form.Label>Data od</Form.Label>
                <Form.Control type="date" {...register("dateFrom")} />
            </Form.Group>

            <Form.Group controlId="dateTo" className="mb-3">
                <Form.Label>Data do</Form.Label>
                <Form.Control type="date" {...register("dateTo")} />
            </Form.Group>
        </>
    );
}
