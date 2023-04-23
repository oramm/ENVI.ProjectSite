import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Spinner, FormControlProps, Button, Modal, Alert } from "react-bootstrap";
import { AsyncTypeahead, Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { RenderMenuItemChildren } from 'react-bootstrap-typeahead/types/components/TypeaheadMenu';
import { ControllerRenderProps, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form/dist/types';

import MainSetup from '../../React/MainSetupReact';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import { useFormContext } from '../FormContext';
import { Controller } from 'react-hook-form';

type ContractTypeSelectFormElementProps = {
    onChange?: (selectedRepositoryItems: RepositoryDataItem[]) => void,
    selectedRepositoryItems?: RepositoryDataItem[],
    typesToInclude?: 'our' | 'other' | 'all'
    isValid?: boolean,
    isInvalid?: boolean,
    required?: boolean,
}

/** Pole wyboru typu kontraktu */
export function ContractTypeSelectFormElementOLD({
    //onChange,
    //selectedRepositoryItems,
    typesToInclude = 'all',
    isInvalid,
    isValid
}: ContractTypeSelectFormElementProps) {
    const label = 'Typ Kontraktu';
    const repository = MainSetup.contractTypesRepository;
    const { register, watch, setValue } = useFormContext();

    function makeoptions(repositoryDataItems: RepositoryDataItem[]) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (typesToInclude === 'all') return true;
            if (typesToInclude === 'our' && item.isOur) return true;
            if (typesToInclude === 'other' && !item.isOur) return true;
            return false;
        });

        const options = filteredItems.map((item) => {
            return { label: `${item.name}`, value: item.id }
        });
        return options;
    }

    function handleOnChange(selectedItems: unknown[]) {
        const selectedRepositoryItems = (selectedItems as { label: string, value: number }[])
            .map((item) => {
                const foundItem = repository.items.find((repoItem) => repoItem.id === item.value);
                return foundItem;
            })
            .filter((item): item is RepositoryDataItem => item !== undefined);
        //onChange(selectedRepositoryItems);
        setValue('contractType', selectedRepositoryItems);
    }
    isValid = watch('contractTypeIsValid', true);
    return (
        <Form.Group controlId={label}>
            <Form.Label>{label}</Form.Label>
            <Typeahead
                id={label}
                options={makeoptions(repository.items)}
                onChange={handleOnChange}
                //selected={makeoptions(selectedRepositoryItems)}
                placeholder="-- Wybierz typ --"
                isValid={isValid}
                isInvalid={isInvalid}
            //{...register('contractType', { required: true })}
            />
        </Form.Group>
    );
}

export function ContractTypeSelectFormElement({
    onChange,
    selectedRepositoryItems,
    typesToInclude = 'all',
    isInvalid,
    isValid,
    required = false,
}: ContractTypeSelectFormElementProps) {
    const useFormContextOrEmpty = () => {
        try {
            const context = useFormContext();
            return context;
        } catch {
            return null;
        }
    };
    const formContext = useFormContextOrEmpty();
    const { control = null, watch = null, setValue = null, formState = null } = formContext || {};

    const label = 'Typ Kontraktu';
    const repository = MainSetup.contractTypesRepository;

    function makeoptions(repositoryDataItems: RepositoryDataItem[]) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (typesToInclude === 'all') return true;
            if (typesToInclude === 'our' && item.isOur) return true;
            if (typesToInclude === 'other' && !item.isOur) return true;
            return false;
        });
        return filteredItems;
    }

    function handleOnChange(selectedOptions: unknown[], field?: ControllerRenderProps<any, "contractType">) {
        selectedOptions.filter((item): item is RepositoryDataItem => item !== undefined);
        if (setValue && field) {
            setValue('contractType', selectedOptions);
            field.onChange(selectedOptions);
            console.log('selectedOptions', selectedOptions);
        } else if (onChange)
            onChange(selectedOptions as RepositoryDataItem[]);
    }

    if (watch)
        watch('contractTypeIsValid', true);

    const MenuItemBody = useCallback((myOption: RepositoryDataItem) => {
        return <div>
            <span>{myOption.name}</span>
            <div className="text-muted small">{myOption.description}</div>
        </div>;
    }, [])

    return (
        <Form.Group controlId={label}>
            <Form.Label>{label}</Form.Label>
            {control ? (
                <>
                    <Controller
                        name="contractType"
                        control={control}
                        rules={{ required: { value: required, message: 'Wybierz typ kontraktu' } }}
                        defaultValue={makeoptions(selectedRepositoryItems || [])}
                        render={({ field }) => (
                            <Typeahead
                                id={`${label}-controlled`}
                                labelKey="name"
                                options={makeoptions(repository.items)}
                                onChange={(items) => handleOnChange(items, field)}
                                selected={field.value}
                                placeholder="-- Wybierz typ --"
                                isValid={!(formState && formState.errors?.contractType)}
                                isInvalid={!!(formState && formState.errors?.contractType)}
                                renderMenuItemChildren={(option, props, index) => {
                                    return MenuItemBody(option as RepositoryDataItem);
                                }}
                            />
                        )}
                    />
                    {formState && formState.errors?.contractType && (
                        <Form.Text className="text-danger">
                            {formState.errors.contractType.message as string}
                        </Form.Text>

                    )}
                </>
            ) : (
                <Typeahead
                    id={`${label}-uncontrolled`}
                    labelKey="name"
                    options={makeoptions(repository.items)}
                    onChange={handleOnChange}
                    selected={makeoptions(selectedRepositoryItems as RepositoryDataItem[])}
                    placeholder="-- Wybierz typ --"
                    isValid={isValid}
                    isInvalid={isInvalid}
                    renderMenuItemChildren={(option, props, index) => {
                        return MenuItemBody(option as RepositoryDataItem);
                    }}

                />
            )}
        </Form.Group>
    );
}

type PersonsSelectFormElementProps = {
    label: string,
    onChange: React.Dispatch<React.SetStateAction<RepositoryDataItem[]>>,
    repository: RepositoryReact,
    selectedRepositoryItems: RepositoryDataItem[],
    multiple?: boolean
    isValid?: boolean,
    isInvalid?: boolean,
}

export function PersonSelectFormElement({ label, onChange, selectedRepositoryItems, repository, multiple, isValid, isInvalid }: PersonsSelectFormElementProps) {
    function makeoptions(repositoryDataItems: RepositoryDataItem[]) {
        return repositoryDataItems.map((item) => ({ label: `${item.name} ${item.surname}`, value: item.id }));
    }

    function handleOnChange(selectedItems: unknown[]) {
        const selectedRepositoryItems = (selectedItems as { label: string, value: number }[])
            .map((item) => {
                const foundItem = repository.items.find((repoItem) => repoItem.id === item.value);
                return foundItem;
            })
            .filter((item): item is RepositoryDataItem => item !== undefined);
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
                isValid={isValid}
                isInvalid={isInvalid}
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
    multiple?: boolean,
    isRequired?: boolean;
    renderMenuItemChildren?: RenderMenuItemChildren
    register?: UseFormRegister<FieldValues>
    name?: string
    errors?: FieldErrors<FieldValues>
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
    multiple = false,
    isRequired = false,
    register,
    name,
    errors
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
            isValid={isRequired && selectedRepositoryItems && selectedRepositoryItems.length > 0}
            isInvalid={isRequired && (!selectedRepositoryItems || selectedRepositoryItems.length === 0)}
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
        <Form.Control
            type="text"
            name="value"
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            ref={inputRef}
        />
    );
}

type FileInputProps = {
    fieldName: string;
    isRequired?: boolean;
    acceptedFileTypes?: string;
}

/**Pole dodawania plików
 * @param fieldName nazwa pola w formularzu
 * @param isRequired czy pole jest wymagane
 * @param acceptedFileTypes typy plików dozwolone do dodania np. "image/*" lub 
 * "image/png, image/jpeg, application/msword, application/vnd.ms-excel, application/pdf"
 */
export function FileInput({
    fieldName,
    isRequired = false,
    acceptedFileTypes = '',
}: FileInputProps) {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files && event.target.files[0];

        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFile(selectedFile);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    return (
        <Form.Group>
            <Form.Label>Wybierz plik</Form.Label>
            <Form.Control
                type="file"
                name={fieldName}
                onChange={handleFileChange}
                required={isRequired}
                accept={acceptedFileTypes}
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

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface AlertComponentProps {
    message: string;
    type: AlertType;
    timeout?: number;
}

const AlertComponent: React.FC<AlertComponentProps> = ({ message, type, timeout = 3000 }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, timeout);

        return () => {
            clearTimeout(timer);
        };
    }, [timeout]);

    if (!show) {
        return null;
    }

    return (
        <Alert variant={type} onClose={() => setShow(false)} dismissible>
            {message}
        </Alert>
    );
};


export function ConfirmModal({ show, onClose, title, prompt, onConfirm }: { show: boolean, onClose: () => void, title: string, prompt: string, onConfirm: () => Promise<void> }) {
    const [isWaiting, setIsWaiting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function handleConfirmAndClose() {
        setIsWaiting(true);
        try {
            await onConfirm();
        }
        catch (e) {
            if (e instanceof Error) {
                setIsError(true);
                setErrorMessage(e.message);
            }
            console.log(e);
        }
        setIsWaiting(false);
        onClose();
    }

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {prompt}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Anuluj
                </Button>
                <Button variant="primary" onClick={handleConfirmAndClose}>
                    Ok
                    {isWaiting && <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />}
                </Button>
                {isError && (
                    <AlertComponent
                        message={errorMessage}
                        type='danger'
                        timeout={5000}
                    />
                )}
            </Modal.Footer>
        </Modal>
    );
}