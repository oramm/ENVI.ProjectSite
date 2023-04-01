import React, { useEffect, useRef, useState } from 'react';
import { Form, Spinner, FormControlProps } from "react-bootstrap";
import { AsyncTypeahead, Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { RenderMenuItemChildren } from 'react-bootstrap-typeahead/types/components/TypeaheadMenu';

import MainSetup from '../../React/MainSetupReact';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';

/** Pole wyboru typu kontraktu */
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
    onChange: React.Dispatch<React.SetStateAction<RepositoryDataItem[]>>,
    repository: RepositoryReact,
    selectedRepositoryItems: RepositoryDataItem[],
    multiple?: boolean
}

export function PersonSelectFormElement({ label, onChange, selectedRepositoryItems, repository, multiple }: PersonsSelectFormElementProps) {
    function makeoptions(repositoryDataItems: RepositoryDataItem[]) {
        console.log('makeoptions:: ', repositoryDataItems);
        return repositoryDataItems.map((item) => ({ label: `${item.name} ${item.surname}`, value: item.id }));
    }

    function handleOnChange(selectedItems: unknown[]) {
        const selectedRepositoryItems = (selectedItems as { label: string, value: number }[])
            .map((item) => {
                const foundItem = repository.items.find((repoItem) => repoItem.id === item.value);
                return foundItem;
            })
            .filter((item): item is RepositoryDataItem => item !== undefined);
        console.log('onChange(selectedRepositoryItems):: ', selectedItems);
        onChange(selectedRepositoryItems);
    }

    return (
        <Form.Group controlId={label}>
            <Form.Label>{label}</Form.Label>
            <Typeahead
                id={label}
                options={makeoptions(repository.items)}
                onChange={handleOnChange}
                selected={makeoptions(selectedRepositoryItems)}
                placeholder="-- Wybierz osobę --"
                multiple={multiple}
            />
        </Form.Group>
    );
}

type MyAsyncTypeaheadProps = {
    repository: RepositoryReact,
    onChange?: (selected: any[]) => void,
    selectedRepositoryItems?: RepositoryDataItem[],
    labelKey: string
    searchKey?: string,
    additionalFieldsKeysValues?: { key: string, value: string }[],
    specialSerwerSearchActionRoute?: string
    multiple?: boolean
    renderMenuItemChildren?: RenderMenuItemChildren
}
/**
 * @param repository repozytorium z którego pobierane są dane
 * @param onChange zaktualizuj setstate projects komponentu nadrzędnego
 * @param selectedRepositoryItems aktualnie wybrane elementy
 * @param labelKey nazwa pola w repozytorium które ma być wyświetlane w polu wyboru
 * @param searchKey nazwa pola w repozytorium które ma być wyszukiwane po stronie serwera (sprawdź odpowiedni controller) domyślnie jest równe labelKey
 * @param additionalFieldsKeysValues dodatkowe pola które mają być wyszukiwane na serwerze
 * @param specialSerwerSearchActionRoute nazwa nietypowego route na serwerze która ma być wywołana zamiast standardowego z RepositoryReact
 * @param multiple czy pole wyboru ma być wielokrotnego wyboru 
 * @param menuItemChildren dodatkowe elementy wyświetlane w liście wyboru  
*/
export function MyAsyncTypeahead({
    repository,
    onChange,
    selectedRepositoryItems,
    labelKey,
    searchKey = labelKey,
    additionalFieldsKeysValues = [],
    specialSerwerSearchActionRoute,
    renderMenuItemChildren = (option: any) => <>{option[labelKey]}</>,
    multiple = false
}: MyAsyncTypeaheadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    function handleSearch(query: string) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(searchKey, query);
        additionalFieldsKeysValues.forEach((field) => {
            formData.append(field.key, field.value);
        });
        repository.loadItemsfromServer(formData, specialSerwerSearchActionRoute)
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
            multiple={multiple}
            newSelectionPrefix="Dodaj nowy: "
            placeholder="-- Wybierz opcję --"
            renderMenuItemChildren={renderMenuItemChildren}
        />
    );
};

export function handleEditMyAsyncTypeaheadElement(
    currentSelectedDataItems: any[],
    previousSelectedItems: RepositoryDataItem[],
    setSuperiorElementState: React.Dispatch<React.SetStateAction<RepositoryDataItem[]>>
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

    setSuperiorElementState(finalItemsSelected);
    console.log('handleEditMyAsyncTypeaheadElement:: ', finalItemsSelected);
}

type ValueInPLNInputProps = {
    value: string,
    onChange: (value: string) => void,
}

export function ValueInPLNInput({ value, onChange }: ValueInPLNInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    function formatValue(value: string) {
        return new Intl.NumberFormat('pl-PL', {
            style: 'decimal',
            minimumFractionDigits: 2,
        }).format(parseFloat(value) || 0);
    };

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value.replace(/\s/g, '');
        const cursorPosition = e.target.selectionStart;
        onChange(newValue);

        if (inputRef.current && cursorPosition) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    };

    function handleInputBlur() {
        onChange(formatValue(value));
    };

    return (
        <Form.Group controlId="valueInPLN">
            <Form.Label>Wartość w PLN</Form.Label>
            <Form.Control
                type="text"
                name="value"
                value={value}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                ref={inputRef}
            />
        </Form.Group>
    );
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