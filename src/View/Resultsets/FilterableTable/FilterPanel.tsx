import React, { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { FieldValues, useForm } from "react-hook-form";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { FormProvider } from "../../Modals/FormContext";
import { useFilterableTableContext } from "./FilterableTableContext";
import { FilterableTableSnapShot, FilterPanelProps } from "./FilterableTableTypes";
import { yupResolver } from "@hookform/resolvers/yup";

const EMPTY_FIXED_CRITERIA: FieldValues = {};

export function FilterPanel<DataItemType extends RepositoryDataItem>({
    FilterBodyComponent,
    repository,
    validationSchema = undefined,
    fixedCriteria,
    autoSearchOnReset = false,
}: FilterPanelProps) {
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(true);
    const { setObjects, id, sections, setSections, snapshotMode, sectionsFilterHandlers } =
        useFilterableTableContext<DataItemType>();

    const formMethods = useForm({
        resolver: validationSchema ? yupResolver(validationSchema) : undefined,
        defaultValues: {},
        mode: "onChange",
    });

    const snapshotName = `filtersableTableSnapshot_${id}`;
    const effectiveFixedCriteria = fixedCriteria ?? EMPTY_FIXED_CRITERIA;
    const fixedCriteriaKey = JSON.stringify(effectiveFixedCriteria);

    const { reset } = formMethods;

    function mergeFixedCriteria(criteria: FieldValues = {}) {
        return { ...criteria, ...effectiveFixedCriteria };
    }

    function applyCriteriaToForm(criteria: FieldValues = {}) {
        for (let key in criteria) {
            const nextValue = criteria[key];
            const currentValue = formMethods.getValues(key);
            if (Object.is(currentValue, nextValue)) continue;
            (formMethods.setValue as (name: string, value: any) => void)(key, nextValue);
        }
    }

    //odtwórz stan z sessionStorage
    useEffect(() => {
        const storedSnapshot = sessionStorage.getItem(snapshotName);
        if (storedSnapshot) {
            const { criteria } = JSON.parse(storedSnapshot) as FilterableTableSnapShot<DataItemType>;
            const initialCriteria = mergeFixedCriteria(criteria);
            applyCriteriaToForm(initialCriteria);
        }

        // fixed criteria must always win over snapshot values
        applyCriteriaToForm(effectiveFixedCriteria);
    }, [snapshotName, fixedCriteriaKey]);

    useEffect(() => {
        applyCriteriaToForm(effectiveFixedCriteria);
    }, [fixedCriteriaKey]);

    function saveSnapshotToStorage(criteria: FieldValues = formMethods.getValues(), result?: DataItemType[]) {
        const filterableTableSnapshot: FilterableTableSnapShot<DataItemType> = {
            criteria: mergeFixedCriteria(criteria),
            ...(snapshotMode !== "criteria-only" ? { storedObjects: result || [] } : {}),
        };
        sessionStorage.setItem(snapshotName, JSON.stringify(filterableTableSnapshot));
    }

    async function handleSubmitSearchFlat(data: FieldValues) {
        setIsReady(false);
        setError(null); // Resetowanie stanu błędu przed nowym żądaniem
        try {
            const criteria = mergeFixedCriteria(data);
            const result = (await repository.loadItemsFromServerPOST([criteria])) as DataItemType[];
            setObjects(result);
            saveSnapshotToStorage(criteria, result);
        } catch (err) {
            if (err instanceof Error)
                setError(err.message || "Wystąpił błąd podczas ładowania danych. Spróbuj ponownie.");
        } finally {
            setIsReady(true);
        }
    }

    async function handleSubmitSearchSections(data: FieldValues) {
        if (!sectionsFilterHandlers) return;
        setIsReady(false);
        setError(null);
        try {
            const criteria = mergeFixedCriteria(data);
            const newSections = await sectionsFilterHandlers.onSubmitSections(criteria);
            setSections(newSections);
            saveSnapshotToStorage(criteria);
        } catch (err) {
            if (err instanceof Error)
                setError(err.message || "Wystąpił błąd podczas ładowania danych. Spróbuj ponownie.");
        } finally {
            setIsReady(true);
        }
    }

    async function handleSubmitSearch(data: FieldValues) {
        if (sectionsFilterHandlers) return handleSubmitSearchSections(data);
        return handleSubmitSearchFlat(data);
    }

    const handleReset = async () => {
        const allFields = formMethods.getValues();
        const resetValues = Object.keys(allFields).reduce((acc: any, curr) => {
            acc[curr] = curr in effectiveFixedCriteria ? effectiveFixedCriteria[curr] : "";
            return acc;
        }, {});

        console.log("Wartości po resecie:", resetValues);
        reset(resetValues);

        if (sectionsFilterHandlers) {
            const newSections = sectionsFilterHandlers.onResetSections();
            setSections(newSections);
            saveSnapshotToStorage(resetValues);
            return;
        }

        if (autoSearchOnReset) {
            await handleSubmitSearchFlat(resetValues);
            return;
        }

        saveSnapshotToStorage(resetValues);
    };

    return (
        <FormProvider value={formMethods}>
            <Form onSubmit={formMethods.handleSubmit(handleSubmitSearch)}>
                <FilterBodyComponent />
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}
                <Row xl={1} className="mt-2">
                    <Form.Group as={Col}>
                        <Button type="submit" className="me-2">
                            {"Szukaj "}
                            {!isReady && (
                                <Spinner
                                    className="ml-1"
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                            )}
                        </Button>
                        <Button variant="outline-secondary" onClick={handleReset}>
                            Wyczyść
                        </Button>
                    </Form.Group>
                </Row>
            </Form>
        </FormProvider>
    );
}
