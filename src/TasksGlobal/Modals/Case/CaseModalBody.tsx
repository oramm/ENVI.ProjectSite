import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { Case, CaseType, MilestoneData } from "../../../../Typings/bussinesTypes";
import { CaseTypeSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function CaseModalBody({ isEditing, initialData, contextData, additionalProps }: ModalBodyProps<Case>) {
    const {
        register,
        reset,
        getValues,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();
    const _type = watch("_type");
    const _parent = (initialData?._parent || contextData) as MilestoneData;
    // Typ z góry wybrany, gdy sprawę dodajemy z poziomu folderu typu w drzewie TasksGlobal.
    const preselectedCaseType = additionalProps?.preselectedCaseType as CaseType | undefined;

    useEffect(() => {
        console.log("CaseModalBody useEffect", initialData);
        const resetData = {
            _parent,
            _type: initialData?._type ?? preselectedCaseType,
            parentCaseId: initialData?.parentCaseId,
            name: initialData?.name,
            description: initialData?.description || "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    function shoulShowCaseNameField() {
        if (initialData?._type?.isUniquePerMilestone) return false;
        if (_type?.isUniquePerMilestone) return false;
        return true;
    }

    return (
        <>
            {!isEditing && (
                <CaseTypeSelector
                    milestoneType={_parent._type}
                    filterFn={(item: CaseType) => !item.isSubCaseOnly}
                />
            )}
            {shoulShowCaseNameField() && (
                <Form.Group controlId="name">
                    <Form.Label>Nazwa sprawy</Form.Label>
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

