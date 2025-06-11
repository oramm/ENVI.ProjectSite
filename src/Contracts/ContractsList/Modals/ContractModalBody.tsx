import React, { useCallback, useEffect } from "react";
import {
    ContractRangeSelector,
    ProjectSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import {
    ContractRangePerContractData,
    OtherContract,
    OurContract,
    ProjectData,
} from "../../../../Typings/bussinesTypes";
import { contractRangesRepository, projectsRepository } from "../ContractsController";
import ToolsDate from "../../../React/Tools/ToolsDate";
import ToolsForms from "../../../React/Tools/ToolsForms";
import { ErrorMessage, ValueInPLNInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { ContractStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import { useFieldArray } from "react-hook-form";
import { DeleteIconButton } from "../../../View/Resultsets/CommonComponents";
import { hasError } from "../../../View/Resultsets/CommonComponentsController";

export function ContractModalBody({ isEditing, initialData }: ModalBodyProps<OurContract | OtherContract>) {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
        trigger,
        control,
    } = useFormContext();

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "_contractRangesPerContract",
    });

    const watchAllFields = watch();
    let startDateSugestion: string | undefined;
    let endDateSugestion: string | undefined;
    let guaranteeEndDateSugestion: string | undefined;

    if (isEditing) {
        startDateSugestion = initialData?.startDate;
        endDateSugestion = initialData?.endDate;
        guaranteeEndDateSugestion = initialData?.guaranteeEndDate;
    } else {
        startDateSugestion = new Date().toISOString().slice(0, 10);
        endDateSugestion = ToolsDate.addDays(startDateSugestion, 365).toISOString().slice(0, 10);
        guaranteeEndDateSugestion = ToolsDate.addDays(endDateSugestion, 365 * 2)
            .toISOString()
            .slice(0, 10);
    }

    useEffect(() => {
        setValue("name", initialData?.name || "", { shouldValidate: true });
        setValue("number", initialData?.number || "", { shouldValidate: true });
        setValue("alias", initialData?.alias || "", { shouldValidate: true });
        setValue("comment", initialData?.comment || "", { shouldValidate: true });
        setValue("value", initialData?.value || "", { shouldValidate: true });
        setValue("status", initialData?.status || "", { shouldValidate: true });
        setValue("startDate", startDateSugestion, { shouldValidate: true });
        setValue("endDate", endDateSugestion, { shouldValidate: true });
        setValue("guaranteeEndDate", guaranteeEndDateSugestion, { shouldValidate: true });
    }, [initialData, setValue]);

    // Sync field array with initial data
    useEffect(() => {
        const contractRangesPerContract = initialData?._contractRangesPerContract || [];
        if (contractRangesPerContract.length === 0) {
            // If no ranges, don't add any default rows for contract ranges
            replace([]);
        } else {
            replace(contractRangesPerContract);
        }
    }, [initialData?._contractRangesPerContract, replace]);

    // Trigger validation when fields array changes
    useEffect(() => {
        trigger("_contractRangesPerContract");
    }, [fields.length, trigger]);

    // Debug useEffect - loguje stan formularza podczas edycji
    useEffect(() => {
        if (isEditing) {
            console.log("Form state debug:", {
                watchAllFields,
                errors,
                fieldsLength: fields.length,
                initialData,
            });
        }
    }, [isEditing, watchAllFields, errors, fields.length, initialData]);

    const handleAddRange = useCallback(() => {
        append({} as ContractRangePerContractData);
        // Validation will be triggered automatically by useEffect watching fields.length
    }, [append]);

    const handleRemoveRange = useCallback(
        (index: number) => {
            remove(index);
            // Validation will be triggered automatically by useEffect watching fields.length
        },
        [remove]
    );

    function renderRanges() {
        return (
            <>
                {fields.map((field, index) => (
                    <Row className="mb-2" key={field.id}>
                        <Col>
                            <ContractRangeSelector
                                repository={contractRangesRepository}
                                multiple={false}
                                name={`_contractRangesPerContract.${index}._contractRange`}
                            />
                        </Col>
                        <Col>
                            <Form.Group controlId={`_contractRangesPerContract.${index}.associationComment`}>
                                <Form.Label>Uwagi</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Dodaj komentarz"
                                    isInvalid={hasError(
                                        errors,
                                        `_contractRangesPerContract.${index}.associationComment`
                                    )}
                                    isValid={
                                        !hasError(errors, `_contractRangesPerContract.${index}.associationComment`)
                                    }
                                    {...register(`_contractRangesPerContract.${index}.associationComment`)}
                                />
                                <ErrorMessage
                                    name={`_contractRangesPerContract.${index}.associationComment`}
                                    errors={errors}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs="auto" className="d-flex align-items-center">
                            <DeleteIconButton layout="vertical" onClick={() => handleRemoveRange(index)} />
                        </Col>
                    </Row>
                ))}{" "}
                <Row className="mb-3">
                    <Col>
                        <button type="button" className="btn btn-outline-primary" onClick={handleAddRange}>
                            + Dodaj zakres kontratu
                        </button>
                    </Col>
                </Row>
                <ErrorMessage name="_contractRangesPerContract" errors={errors} />
            </>
        );
    }

    return (
        <>
            <Form.Group controlId="number">
                <Form.Label>Numer kontraktu</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj numer"
                    isInvalid={!!errors?.number}
                    isValid={!errors?.number}
                    {...register("number")}
                />
                <ErrorMessage errors={errors} name="number" />
            </Form.Group>
            <Form.Group controlId="name">
                <Form.Label>Nazwa kontraktu</Form.Label>
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
            {renderRanges()}
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
            <Form.Group controlId="valueInPLN">
                <Form.Label>Wartość netto w PLN</Form.Label>
                <ValueInPLNInput />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="startDate">
                    <Form.Label>Początek</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.startDate}
                        isInvalid={!!errors.startDate}
                        {...register("startDate")}
                        className={
                            !isEditing
                                ? ToolsForms.getSuggestedClass("startDate", watchAllFields, startDateSugestion)
                                : ""
                        }
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
                        className={
                            !isEditing ? ToolsForms.getSuggestedClass("endDate", watchAllFields, endDateSugestion) : ""
                        }
                        onChange={(e) => {
                            register("endDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("startDate");
                            trigger("guaranteeEndDate");
                        }}
                    />
                    <ErrorMessage errors={errors} name="endDate" />
                </Form.Group>
                <Form.Group as={Col} controlId="guaranteeEndDate">
                    <Form.Label>Gwarancja</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.guaranteeEndDate}
                        isInvalid={!!errors.guaranteeEndDate}
                        {...register("guaranteeEndDate")}
                        className={
                            !isEditing
                                ? ToolsForms.getSuggestedClass(
                                      "guaranteeEndDate",
                                      watchAllFields,
                                      guaranteeEndDateSugestion
                                  )
                                : ""
                        }
                        onChange={(e) => {
                            register("guaranteeEndDate").onChange(e); // wywołaj standardowe zachowanie
                            //trigger("startDate");
                        }}
                    />
                    <ErrorMessage errors={errors} name="guaranteeEndDate" />
                </Form.Group>
            </Row>
            <ContractStatusSelector />
        </>
    );
}

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Other lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
export function ProjectSelectorModalBody({ isEditing, additionalProps }: ProjectSelectorProps) {
    const { register, setValue, watch, formState } = useFormContext();
    const project = watch("_project") as ProjectData | undefined;

    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody } = additionalProps;
    if (!SpecificContractModalBody) throw new Error("SpecificContractModalBody is not defined");

    return (
        <>
            {project ? (
                <SpecificContractModalBody isEditing={isEditing} additionalProps={additionalProps} />
            ) : (
                <ProjectSelector repository={projectsRepository} />
            )}
        </>
    );
}
