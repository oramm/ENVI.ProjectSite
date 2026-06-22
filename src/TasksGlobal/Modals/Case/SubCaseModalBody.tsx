import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { Case, CaseType, MilestoneData } from "../../../../Typings/bussinesTypes";
import { CaseTypeSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function SubCaseModalBody({ isEditing, initialData, contextData }: ModalBodyProps<Case>) {
    const {
        register,
        reset,
        watch,
        formState: { errors },
        trigger,
    } = useFormContext();

    const parentCase = (initialData?.parentCaseId ? undefined : contextData) as Case | undefined;
    const _parent = initialData?._parent || parentCase?._parent;
    const parentCaseId = initialData?.parentCaseId || parentCase?.id;
    const _type = watch("_type");

    useEffect(() => {
        const resetData = {
            _parent,
            _type: initialData?._type,
            parentCaseId,
            name: initialData?.name,
            description: initialData?.description || "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    function shouldShowNameField() {
        if (!_type) return false;
        if (_type?.isUniquePerMilestone) return false;
        return true;
    }

    return (
        <>
            {!isEditing && (
                <CaseTypeSelector
                    milestoneType={(_parent as MilestoneData)?._type}
                    filterFn={(item: CaseType) =>
                        Boolean(item.id) &&
                        (parentCase?._type?._allowedSubCaseTypeIds ?? []).includes(item.id!)
                    }
                />
            )}
            {shouldShowNameField() && (
                <Form.Group controlId="name">
                    <Form.Label>Nazwa podsprawy</Form.Label>
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
        </>
    );
}
