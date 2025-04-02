import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { MilestoneData, OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import {
    CaseTypeSelector,
    MilestoneTypeSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { MilestoneStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";

export function ContractMilestoneModalBody({ isEditing, initialData, contextData }: ModalBodyProps<MilestoneData>) {
    const {
        register,
        reset,
        watch,
        formState: { errors },
        trigger,
    } = useFormContext();
    const _type = watch("_type");
    const _contract = (initialData?._contract || contextData) as OurContract | OtherContract;

    useEffect(() => {
        const resetData: Partial<MilestoneData> = {
            _contract,
            _type: initialData?._type,
            name: initialData?.name,
            description: initialData?.description || "",
            startDate: initialData?.startDate,
            endDate: initialData?.endDate,
            status: initialData?.status,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger, _contract]);

    function shouldShowNameField() {
        if (initialData?._type?.isUniquePerContract) return false;
        if (_type?.isUniquePerContract) return false;
        return true;
    }

    return (
        <>
            {!isEditing && <MilestoneTypeSelector contractType={_contract._type} />}

            {shouldShowNameField() && (
                <Form.Group controlId="name" className="mb-2">
                    <Form.Label>Nazwa</Form.Label>
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
            )}
            <Row className="mb-2">
                <Form.Group controlId="startDate" as={Col}>
                    <Form.Label>Data rozpoczęcia</Form.Label>
                    <Form.Control
                        type="date"
                        isInvalid={!!errors?.startDate}
                        isValid={!errors?.startDate}
                        {...register("startDate")}
                    />
                    <ErrorMessage name="startDate" errors={errors} />
                </Form.Group>
                <Form.Group controlId="endDate">
                    <Form.Label>Data zakończenia</Form.Label>
                    <Form.Control
                        type="date"
                        isInvalid={!!errors?.endDate}
                        isValid={!errors?.endDate}
                        {...register("endDate")}
                    />
                    <ErrorMessage name="endDate" errors={errors} />
                </Form.Group>
            </Row>
            <MilestoneStatusSelector showValidationInfo={true} />

            <Form.Group controlId="description">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Dodaj komentarz"
                    isInvalid={!!errors?.description}
                    isValid={!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
        </>
    );
}
