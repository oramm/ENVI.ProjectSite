import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { FieldValues, useForm } from 'react-hook-form';
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { FormProvider } from "../../Modals/FormContext";
import { parseFieldValuesToParams } from "../CommonComponentsController";
import { useFilterableTableContext } from "./FilterableTableContext";

export type FilterPanelProps = {
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
    repository: RepositoryReact,
    onIsReadyChange: React.Dispatch<React.SetStateAction<boolean>>,
    locaFilter: boolean,
}

export type FilterBodyProps = {};

export function FilterPanel<DataItemType extends RepositoryDataItem>({
    FilterBodyComponent,
    repository,
    onIsReadyChange,
    locaFilter = false,
}: FilterPanelProps) {
    const { setObjects, objects, externalUpdate } = useFilterableTableContext<DataItemType>();
    const [originalObjects, setOriginalObjects] = useState<DataItemType[]>([]);

    const formMethods = useForm({ defaultValues: {}, mode: 'onChange' });

    useEffect(() => {
        setOriginalObjects(objects);
    }, [externalUpdate]);

    async function handleSubmitSearch(data: FieldValues) {
        let result: DataItemType[] = [];
        onIsReadyChange(false);
        if (locaFilter)
            result = handleLocalFilter(data);
        else {
            const formData = parseFieldValuesToParams(data);
            result = await repository.loadItemsFromServer(formData) as DataItemType[];
            await handleServerSearch(data);
        }
        setObjects(result);
        onIsReadyChange(true);
    };

    async function handleServerSearch(data: FieldValues) {
        onIsReadyChange(false);
        const formData = parseFieldValuesToParams(data);
        const result = await repository.loadItemsFromServer(formData) as DataItemType[];
        setObjects(result);
        onIsReadyChange(true);
    };

    function handleLocalFilter(filterFormData: FieldValues) {
        return originalObjects.filter(item => {
            for (let key in filterFormData) {
                const filterValue = filterFormData[key];
                if (!filterValue) continue;

                const itemValue = item[key];
                // Jeśli wartość w elemencie jest obiektem, porównaj za pomocą labelKey
                if (typeof itemValue === 'object' && itemValue !== null) {
                    const labelKey = itemValue.labelKey;
                    // Jeśli wartość filtra nie pasuje do wartości labelKey w obiekcie, zwróć false
                    if (String(itemValue[labelKey]).toLowerCase().includes(String(filterValue).toLowerCase()) === false) {
                        return false;
                    }
                } else {
                    // Jeśli wartość w elemencie nie jest obiektem, porównaj bezpośrednio
                    // Jeśli wartość filtra nie pasuje do wartości w obiekcie, zwróć false
                    if (String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase()) === false) {
                        return false;
                    }
                }
            }
            // Jeśli wszystkie pola pasują, zwróć true
            return true;
        });
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