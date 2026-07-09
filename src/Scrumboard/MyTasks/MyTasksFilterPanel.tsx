import React, { useEffect, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Case } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";
import {
    CaseSelectMenuElement,
    ContractSelector,
} from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ContractStatusSelector } from "../../View/Modals/CommonFormComponents/StatusSelectors";
import { FormProvider, useFormContext } from "../../View/Modals/FormContext";

export interface MyTasksFilter {
    _contract?: { id: number } | "";
    statuses?: string[] | "";
    _case?: Case;
}

/** Wąski, pionowy zestaw selektorów (reużyte z „Projekty i zadania"). */
function Body() {
    const { watch, setValue } = useFormContext();
    const _contract = watch("_contract");

    const casesFilterRepository = useMemo(
        () =>
            new RepositoryReact<Case>({
                actionRoutes: { getRoute: "cases", addNewRoute: "", editRoute: "", deleteRoute: "" },
                name: "scrumMyTasksCasesFilter_temp",
            }),
        []
    );

    // reset sprawy po zmianie kontraktu (jak w TasksGlobalFilterBody)
    useEffect(() => {
        setValue("_case", undefined);
    }, [(_contract as { id?: number })?.id]);

    return (
        <>
            <Form.Group controlId="_contract" className="mb-2">
                <Form.Label className="mb-1">Kontrakt</Form.Label>
                <ContractSelector showValidationInfo={false} />
            </Form.Group>
            <Form.Group className="mb-2">
                <ContractStatusSelector
                    showValidationInfo={false}
                    multiple
                    label="Statusy kontraktu"
                />
            </Form.Group>
            {_contract && (
                <Form.Group className="mb-2">
                    <Form.Label className="mb-1">Sprawa</Form.Label>
                    <CaseSelectMenuElement
                        name="_case"
                        repository={casesFilterRepository}
                        showValidationInfo={false}
                        _contract={_contract}
                        multiple={false}
                    />
                </Form.Group>
            )}
        </>
    );
}

export interface MyTasksToggles {
    fullTree: boolean;
    onlyMine: boolean;
    hoursFilledOnly: boolean;
    setFullTree: (v: boolean) => void;
    setOnlyMine: (v: boolean) => void;
    setHoursFilledOnly: (v: boolean) => void;
}

/** Samodzielny lewy panel filtrów dla „Moje zadania" (przełączniki + doładowanie z serwera). */
export default function MyTasksFilterPanel({
    onApply,
    toggles,
}: {
    onApply: (filter: MyTasksFilter) => void;
    toggles: MyTasksToggles;
}) {
    const methods = useForm({ defaultValues: {}, mode: "onChange" });

    const submit = methods.handleSubmit((data) => onApply(data as MyTasksFilter));
    const clear = () => {
        methods.reset({ _contract: "", statuses: "", _case: undefined });
        onApply({});
    };

    return (
        <div className="border rounded-3 p-2 mb-3 bg-light">
            <div className="d-flex flex-column gap-1 mb-2">
                <Form.Check
                    type="switch"
                    id="scrum-mytasks-fulltree"
                    className="mb-0"
                    label="Pokaż pełne drzewo kontraktów (wszystkie zadania)"
                    checked={toggles.fullTree}
                    onChange={(e) => toggles.setFullTree(e.target.checked)}
                />
                <Form.Check
                    type="switch"
                    id="scrum-mytasks-onlymine"
                    className="mb-0"
                    label="Pokaż tylko moje zadania"
                    checked={toggles.onlyMine}
                    onChange={(e) => toggles.setOnlyMine(e.target.checked)}
                />
                <Form.Check
                    type="switch"
                    id="scrum-mytasks-hoursfilled"
                    className="mb-0"
                    label="Pokaż tylko zadania z uzupełnionymi godzinami"
                    checked={toggles.hoursFilledOnly}
                    onChange={(e) => toggles.setHoursFilledOnly(e.target.checked)}
                />
            </div>
            <FormProvider value={methods}>
                <Form onSubmit={submit}>
                    <Body />
                    <div className="d-flex gap-2">
                        <Button type="submit" size="sm">
                            Filtruj
                        </Button>
                        <Button type="button" size="sm" variant="outline-secondary" onClick={clear}>
                            Wyczyść
                        </Button>
                    </div>
                </Form>
            </FormProvider>
        </div>
    );
}
