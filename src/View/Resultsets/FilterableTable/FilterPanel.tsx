import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { FieldValues, useForm } from 'react-hook-form';
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { FormProvider } from "../../Modals/FormContext";
import { parseFieldValuesToParams } from "../CommonComponentsController";
import { useFilterableTableContext } from "./FilterableTableContext";
import { FilterableTableSnapShot, FilterPanelProps } from "./FilterableTableTypes";

export function FilterPanel<DataItemType extends RepositoryDataItem>({
    FilterBodyComponent,
    repository,
    onIsReadyChange,
}: FilterPanelProps) {
    const { setObjects, objects, id } = useFilterableTableContext<DataItemType>();

    const formMethods = useForm({ defaultValues: {}, mode: 'onChange' });
    const snapshotName = `filtersableTableSnapshot_${id}`;

    const { watch, reset } = formMethods;
    const allValues = watch();

    useEffect(() => {
        console.log('Zaktualizowany stan formularza:', allValues);
    }, [allValues]);


    //odtwórz stan z sessionStorage
    useEffect(() => {
        const storedSnapshot = sessionStorage.getItem(snapshotName);
        if (!storedSnapshot) return;

        const { criteria } = JSON.parse(storedSnapshot) as FilterableTableSnapShot<DataItemType>;
        for (let key in criteria) {
            (formMethods.setValue as (name: string, value: any) => void)(key, criteria[key]);
        }
    }, []);

    async function handleSubmitSearch(data: FieldValues) {
        onIsReadyChange(false);
        const formData = parseFieldValuesToParams(data);
        const result = await repository.loadItemsFromServerPOST([data]) as DataItemType[];
        setObjects(result);
        saveSnapshotToStorage(result);
        onIsReadyChange(true);
    };

    function saveSnapshotToStorage(result: DataItemType[]) {
        const filterableTableSnapshot: FilterableTableSnapShot<DataItemType> = {
            criteria: formMethods.getValues(),
            storedObjects: result,
        };
        sessionStorage.setItem(snapshotName, JSON.stringify(filterableTableSnapshot));
        console.log('Saved snapshot: ', filterableTableSnapshot.storedObjects);
    }

    const handleReset = () => {
        const allFields = formMethods.getValues();
        const resetValues = Object.keys(allFields).reduce((acc: any, curr) => {
            acc[curr] = '';
            return acc;
        }, {});

        console.log('Wartości po resecie:', resetValues);
        reset(resetValues);
    };

    return (
        <FormProvider value={formMethods}>
            <Form onSubmit={formMethods.handleSubmit(handleSubmitSearch)}>
                <FilterBodyComponent />
                <Row xl={1} className="mt-2">
                    <Form.Group as={Col} >
                        <Button type="submit" className="me-2">Szukaj</Button>
                        <Button variant="outline-secondary" onClick={handleReset}>Wyczyść</Button>
                    </Form.Group>
                </Row>
            </Form>
        </FormProvider>
    );
}