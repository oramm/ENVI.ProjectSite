import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import RepositoryReact from "../../../React/RepositoryReact";
import { ContractTypeSelectFormElement, MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents";
import { ContractModalBody } from "./ContractModalBody";
import { entitiesRepository } from "../ContractsController";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";

/**Wywoływana w ProjectsSelector jako props  */
export function OtherContractModalBody(props: ModalBodyProps) {
    const initialData = props.initialData;

    const ourRelatedContractsRepository = new RepositoryReact({
        name: "OurRelatedContractsRepository",
        actionRoutes: { addNewRoute: "", editRoute: "", deleteRoute: "", getRoute: "contracts" },
    });

    const { register, setValue, watch, formState, control } = useFormContext();
    const _project = watch("_project");

    useEffect(() => {
        setValue("_type", initialData?._type, { shouldValidate: true });
        setValue("_contractors", initialData?._contractors || [], { shouldValidate: true });
        setValue("_ourContract", initialData?._ourContract, { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            {" "}
            {!props.isEditing ? <ContractTypeSelectFormElement typesToInclude="other" /> : null}
            <ContractModalBody {...props} />
            <Form.Group>
                <Form.Label>Wykonawcy</Form.Label>
                <MyAsyncTypeahead name="_contractors" labelKey="name" repository={entitiesRepository} multiple={true} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Powiązana usługa IK lub PT</Form.Label>
                <MyAsyncTypeahead
                    name="_ourContract"
                    labelKey="ourId"
                    searchKey="contractOurId"
                    contextSearchParams={{
                        _project,
                        typesToInclude: "our",
                    }}
                    repository={ourRelatedContractsRepository}
                    renderMenuItemChildren={(option: any) => (
                        <div>
                            {option.ourId} {option.name}
                        </div>
                    )}
                />
            </Form.Group>
        </>
    );
}
