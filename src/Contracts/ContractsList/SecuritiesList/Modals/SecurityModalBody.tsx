import React, { useEffect, useRef, useState } from "react";
import {
    ContractSelectFormElement,
    ProjectSelector,
} from "../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import { Project, Security } from "../../../../../Typings/bussinesTypes";
import { contractsRepository, projectsRepository } from "../../ContractsController";
import { ErrorMessage, ValueInPLNInput } from "../../../../View/Modals/CommonFormComponents/GenericComponents";
import { SecurityStatusSelectFormElement } from "../../../../View/Modals/CommonFormComponents/StatusSelectors";

export function SecurityModalBody({ isEditing, initialData }: ModalBodyProps<Security>) {
    const {
        register,
        reset,
        watch,
        formState: { errors },
        trigger,
    } = useFormContext();
    const _project = watch("_project") as Project | undefined;
    useEffect(() => {
        const resetData: any = {
            _contract: initialData?._contract,
            description: initialData?.description || "",
            value: initialData?.value || "",
            returnedValue: initialData?.returnedValue || "",
            status: initialData?.status || "",
        };

        if (!isEditing) resetData._project = _project;
        reset(resetData);

        trigger();
    }, [initialData, reset]);

    return (
        <>
            {!isEditing && (
                <Form.Group controlId="_contract">
                    <Form.Label>Wybierz kontrakt</Form.Label>
                    <ContractSelectFormElement
                        name="_contract"
                        typesToInclude="our"
                        repository={contractsRepository}
                        _project={_project}
                        readOnly={!isEditing}
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
                <ErrorMessage errors={errors} name="description" />
            </Form.Group>
            <Form.Group controlId="valueInPLN">
                <Form.Label>Wartość</Form.Label>
                <ValueInPLNInput />
            </Form.Group>
            <Form.Group controlId="returnedValue">
                <Form.Label>Zwrócono</Form.Label>
                <ValueInPLNInput keyLabel="returnedValue" />
            </Form.Group>
            <SecurityStatusSelectFormElement name="status" showValidationInfo={true} />
        </>
    );
}

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
export function ProjectSelectorModalBody({ isEditing, additionalProps }: ProjectSelectorProps) {
    const { register, setValue, watch, formState, reset, trigger } = useFormContext();
    const project = watch("_project") as Project | undefined;

    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody: SpecificModalBody } = additionalProps;
    if (!SpecificModalBody) throw new Error("SpecificContractModalBody is not defined");
    useEffect(() => {
        reset({ _project: undefined });
        trigger();
    }, [reset]);
    return (
        <>
            {project ? (
                <SpecificModalBody isEditing={isEditing} additionalProps={additionalProps} />
            ) : (
                <ProjectSelector repository={projectsRepository} name="_project" />
            )}
        </>
    );
}
