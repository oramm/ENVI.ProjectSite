import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ContractRoleData, ProjectRoleData, RoleData } from "../../../../Typings/bussinesTypes";
import { PersonSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { personsRepository } from "../RolesController";
import { RoleGroupSelector } from "../../../View/Modals/CommonFormComponents/OtherAttributesSelectors";

export function RoleModalBody({ isEditing, initialData }: ModalBodyProps<RoleData>) {
    const {
        register,
        reset,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: Partial<RoleData> = {
            name: initialData?.name || "",
            description: initialData?.description || "",
            groupName: initialData?.groupName || "",
            _person: initialData?._person,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <RoleGroupSelector />

            <Form.Group controlId="name">
                <Form.Label>Nazwa roli</Form.Label>
                <Form.Control
                    placeholder="Podaj nazwę roli"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>

            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj opis roli"
                    isInvalid={!!errors?.description}
                    isValid={!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
            <Form.Group controlId="_person" className="mb-4">
                <Form.Label>Osoba</Form.Label>
                <PersonSelector name="_person" repository={personsRepository} />
            </Form.Group>
        </>
    );
}
