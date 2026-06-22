import React, { useEffect, useState } from "react";
import {
    FinancialAidProgrammeSelector,
    FocusAreaSelector,
    FocusAreaSelectorPreloaded,
} from "../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import { ApplicationCallData, FinancialAidProgrammeData } from "../../../../../Typings/bussinesTypes";
import { focusAreasRepository } from "../../FocusAreasController";
import { ApplicationCallStatusSelector } from "../../../../View/Modals/CommonFormComponents/StatusSelectors";
import { ErrorMessage } from "../../../../View/Modals/CommonFormComponents/GenericComponents";
import { FinancialAidProgrammeInlineCreateDrawer } from "../../../../View/Modals/InlineCreateDrawers";

export function ApplicationCallModalBody({ isEditing, initialData }: ModalBodyProps<ApplicationCallData>) {
    const {
        register,
        reset,
        setValue,
        formState: { errors },
        trigger,
        watch,
    } = useFormContext();

    const _financialAidProgramme = watch("_financialAidProgramme") as FinancialAidProgrammeData | undefined;
    const [showCreateProgramme, setShowCreateProgramme] = useState(false);

    useEffect(() => {
        const resetData: any = {
            _focusArea: initialData?._focusArea,
            description: initialData?.description,
            url: initialData?.url,
            startDate: initialData?.startDate,
            endDate: initialData?.endDate,
            status: initialData?.status,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);

    return (
        <>
            {!isEditing && (
                <Form.Group controlId="_financialAidProgramme">
                    <Form.Label>Program wsparcia</Form.Label>
                    <FinancialAidProgrammeSelector showValidationInfo={true} onRequestCreate={() => setShowCreateProgramme(true)} />
                </Form.Group>
            )}
            {_financialAidProgramme && (
                <Form.Group controlId="_focusArea">
                    <FocusAreaSelectorPreloaded
                        repository={focusAreasRepository}
                        _financialAidProgramme={_financialAidProgramme}
                        showValidationInfo={true}
                    />
                </Form.Group>
            )}
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
            <Form.Group controlId="url">
                <Form.Label>URL</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj URL"
                    isValid={!errors.url}
                    isInvalid={!!errors?.url}
                    {...register("url")}
                />
                <ErrorMessage name="url" errors={errors} />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="startDate">
                    <Form.Label>Data rozpoczęcia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.startDate}
                        isInvalid={!!errors?.startDate}
                        {...register("startDate")}
                    />
                    <ErrorMessage name="startDate" errors={errors} />
                </Form.Group>

                <Form.Group as={Col} controlId="endDate">
                    <Form.Label>Data zakończenia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.endDate}
                        isInvalid={!!errors?.endDate}
                        {...register("endDate")}
                    />
                    <ErrorMessage name="endDate" errors={errors} />
                </Form.Group>
            </Row>
            <ApplicationCallStatusSelector showValidationInfo={true} />
            <FinancialAidProgrammeInlineCreateDrawer
                show={showCreateProgramme}
                onHide={() => setShowCreateProgramme(false)}
                title="Nowy program wsparcia"
                onCreated={(created) => setValue("_financialAidProgramme", created, { shouldValidate: true })}
            />
        </>
    );
}
