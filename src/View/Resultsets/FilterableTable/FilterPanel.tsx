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
        const result = await repository.loadItemsFromServer(formData) as DataItemType[];
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

    return (
        <FormProvider value={formMethods}>
            <Form onSubmit={formMethods.handleSubmit(handleSubmitSearch)}>
                <FilterBodyComponent />
                <Row xl={1}>
                    <Form.Group as={Col} >
                        <Button type="submit">Szukaj</Button>
                    </Form.Group>
                </Row>
            </Form>
        </FormProvider>
    );
}