import React, { useEffect, useState } from 'react';
import { Form, Spinner, FormControlProps } from "react-bootstrap";
import { AsyncTypeahead, Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

import MainSetup from '../../React/MainSetupReact';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';

export function ContractTypeSelectFormElement({ onChange, value }: { onChange: React.ChangeEventHandler<HTMLInputElement>, value?: number }) {
    return (
        <Form.Group controlId="typeId">
            <Form.Label>Typ Kontraktu</Form.Label>
            <Form.Control
                as="select"
                name="typeId"
                onChange={onChange}
                value={value}
            >
                <option value="">-- Wybierz opcję --</option>
                {MainSetup.contractTypesRepository.items.map((contractType: any) => (
                    <option key={contractType.id} value={contractType.id}>{contractType.name}</option>
                ))}
            </Form.Control>
        </Form.Group >
    );
}
type PersonsSelectFormElementProps = {
    label: string,
    onChange: (selected: unknown[]) => void,
    value?: RepositoryDataItem,
    repository: RepositoryReact
}
export function PersonSelectFormElement({ label, onChange, value, repository }: PersonsSelectFormElementProps) {
    const options = repository.items.map((item) => ({ label: `${item.name} ${item.surname}`, value: item.id }));

    return (
        <Form.Group controlId={label}>
            <Form.Label>{label}</Form.Label>
            <Typeahead
                id={label}
                options={options}
                onChange={onChange}
                //selected={options.filter(option => { return value ? value.id == option.value : false })}
                placeholder="-- Wybierz opcję --"
            />
        </Form.Group>
    );
}

type MyAsyncTypeaheadProps = {
    repository: RepositoryReact,
    onChange?: (selected: any[]) => void,
    selectedRepositoryItems?: RepositoryDataItem[],
    labelKey: string
}
export function MyAsyncTypeahead({ repository, onChange, selectedRepositoryItems, labelKey }: MyAsyncTypeaheadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    function handleSearch(query: string) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(labelKey, query);
        repository.loadItemsfromServer(formData)
            .then((items) => {
                // Filter out object that are present in selectedRepositoryItems 
                const filteredItems = items.filter(item => {
                    return selectedRepositoryItems ? !selectedRepositoryItems.some((selectedItem: any) => selectedItem.id == item.id) : true;
                });
                setOptions(filteredItems);
                setIsLoading(false);
            });
    }

    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBy = () => true;

    return (
        <AsyncTypeahead
            filterBy={filterBy}
            id="async-example"
            isLoading={isLoading}
            labelKey={labelKey}
            minLength={3}
            onSearch={handleSearch}
            options={options}
            onChange={onChange}
            selected={selectedRepositoryItems}
            multiple
            newSelectionPrefix="Dodaj nowy: "
            placeholder="-- Wybierz opcję --"
            renderMenuItemChildren={(option: any) => (
                <>
                    <div>{option[labelKey]}</div>
                </>
            )}
        />
    );
};

export function handleEditMyAsyncTypeaheadElement(
    currentSelectedDataItems: any[],
    previousSelectedItems: RepositoryDataItem[],
    setState: React.Dispatch<React.SetStateAction<RepositoryDataItem[]>>
) {
    const currentAndPreviousSelections = previousSelectedItems.concat(currentSelectedDataItems);
    const allUniqueDataItems = currentAndPreviousSelections.reduce((uniqueItems: RepositoryDataItem[], dataItem) => {
        const isDuplicate = uniqueItems.some(item => item.id === dataItem.id);
        if (!isDuplicate) {
            uniqueItems.push(dataItem);
        }
        return uniqueItems;
    }, []);
    const finalItemsSelected = (currentSelectedDataItems.length < allUniqueDataItems.length) ? currentSelectedDataItems : allUniqueDataItems;

    setState(finalItemsSelected);
}

export function ProgressBar() {
    return (
        <progress style={{ height: "5px" }} />
    );
}

export function SpinnerBootstrap() {
    return (
        <Spinner
            animation="border"
            variant="success"
        />
    );
}