import React, { useEffect, useMemo, useCallback } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { MilestoneData, MilestoneDateData, OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import {
    CaseTypeSelector,
    MilestoneTypeSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { MilestoneStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import { hasError } from "../../../View/Resultsets/CommonComponentsController";
import { useFieldArray, FieldErrors } from "react-hook-form";

export function ContractMilestoneModalBody({ isEditing, initialData, contextData }: ModalBodyProps<MilestoneData>) {
    const {
        register,
        reset,
        watch,
        formState: { errors },
        trigger,
        control,
    } = useFormContext();
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "_dates",
    });

    const _type = watch("_type");
    const _contract = (initialData?._contract || contextData) as OurContract | OtherContract;

    // Memoize processedDates to prevent infinite loops
    const processedDates = useMemo(() => {
        const dates = initialData?._dates;
        if (!dates || dates?.length === 0) return []; // Pusta tablica, jeśli brak dat
        return dates.map((d) => ({
            ...d,
            startDate: d.startDate ? d.startDate.split("T")[0] : "",
            endDate: d.endDate ? d.endDate.split("T")[0] : "",
        }));
    }, [initialData?._dates]);

    // Initialize form fields (excluding field array which is managed separately)
    useEffect(() => {
        const resetData: Partial<MilestoneData> = {
            _contract,
            _type: initialData?._type,
            name: initialData?.name,
            description: initialData?.description || "",
            status: initialData?.status,
            // Note: _dates is excluded - field array manages this independently
        };
        reset(resetData);
    }, [initialData, reset, _contract]); // Sync field array with processed dates (separate from form reset)

    useEffect(() => {
        console.log("Field array update:", { processedDates, fieldsLength: fields.length });
        replace(processedDates);
    }, [processedDates, replace]);

    // Trigger validation when fields array changes
    useEffect(() => {
        console.log("Fields array changed, length:", fields.length);
        trigger("_dates");
    }, [fields.length, trigger]);

    function shouldShowNameField() {
        if (initialData?._type?.isUniquePerContract) return false;
        if (_type?.isUniquePerContract) return false;
        return true;
    }

    function hasAnyDateError(errors: FieldErrors, index: number): boolean {
        return hasError(errors, `_dates.${index}.startDate`) || hasError(errors, `_dates.${index}.endDate`);
    }

    const handleAddDateRange = useCallback(() => {
        console.log("Adding new date range");
        append({
            startDate: "",
            endDate: "",
            description: "",
        });
        // Validation will be triggered automatically by useEffect watching fields.length
    }, [append]);

    const handleRemoveDateRange = useCallback(
        (index: number) => {
            console.log("Removing date range at index:", index);
            remove(index);
            // Validation will be triggered automatically by useEffect watching fields.length
        },
        [remove]
    );

    function renderDates() {
        return fields.map((field, index) => (
            <Row className="mb-2" key={field.id}>
                <Col>
                    <Form.Group controlId={`_dates.${index}.startDate`}>
                        <Form.Label>Data rozpoczęcia</Form.Label>
                        <Form.Control
                            type="date"
                            isInvalid={hasAnyDateError(errors, index)}
                            isValid={!hasAnyDateError(errors, index)}
                            {...register(`_dates.${index}.startDate`)}
                        />
                        <ErrorMessage name={`_dates.${index}.startDate`} errors={errors} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId={`_dates.${index}.endDate`}>
                        <Form.Label>Data zakończenia</Form.Label>
                        <Form.Control
                            type="date"
                            isInvalid={hasAnyDateError(errors, index)}
                            isValid={!hasAnyDateError(errors, index)}
                            {...register(`_dates.${index}.endDate`)}
                        />
                        <ErrorMessage name={`_dates.${index}.endDate`} errors={errors} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId={`_dates.${index}.description`}>
                        <Form.Label>Uwagi</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Dodaj komentarz"
                            isInvalid={hasError(errors, `_dates.${index}.description`)}
                            isValid={!hasError(errors, `_dates.${index}.description`)}
                            {...register(`_dates.${index}.description`)}
                        />
                        <ErrorMessage name={`_dates.${index}.description`} errors={errors} />{" "}
                    </Form.Group>
                </Col>
                <Col xs="auto" className="d-flex align-items-end">
                    {" "}
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveDateRange(index)}
                    >
                        Usuń
                    </button>
                </Col>
            </Row>
        ));
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
            )}{" "}
            {renderDates()}
            <Row className="mb-3">
                <Col>
                    {" "}
                    <button type="button" className="btn btn-outline-primary" onClick={handleAddDateRange}>
                        + Dodaj przedział dat
                    </button>
                </Col>
            </Row>
            <ErrorMessage name="_dates" errors={errors} />
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
