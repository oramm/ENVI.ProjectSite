import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Spinner, FormControlProps, Button, Modal, Alert, InputGroup } from "react-bootstrap";
import { AsyncTypeahead, Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { RenderMenuItemChildren } from 'react-bootstrap-typeahead/types/components/TypeaheadMenu';
import { ControllerRenderProps, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form/dist/types';

import MainSetup from '../../React/MainSetupReact';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import { useFormContext } from '../FormContext';
import { Controller } from 'react-hook-form';
import ContractsController from '../../Contracts/ContractsList/ContractsController';
import { NumberFormatValues, NumericFormat } from 'react-number-format';
import * as Yup from 'yup';
import { FieldValue } from 'react-hook-form/dist/types/fields';

type ProjectSelectorProps = {
    repository: RepositoryReact,
    required?: boolean,
    showValidationInfo?: boolean,
}
export function ProjectSelector({ repository, required = false, showValidationInfo = true }: ProjectSelectorProps) {
    const { register, formState: { errors } } = useFormContext();
    return (
        <>
            <Form.Label>Projekt</Form.Label>
            <MyAsyncTypeahead
                name='_parent'
                labelKey="ourId"
                repository={repository}
                specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
                isRequired={required}
                showValidationInfo={showValidationInfo}
                multiple={false}
            />
        </>
    )
}

type ContractStatusProps = {
    required?: boolean,
    showValidationInfo?: boolean,
}

export function ContractStatus({ required = false, showValidationInfo = true }: ContractStatusProps) {
    const { register, formState: { errors } } = useFormContext();

    return (
        <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control
                as="select"
                isValid={showValidationInfo ? !errors?.status : undefined}
                isInvalid={showValidationInfo ? !!errors?.status : undefined}
                {...register('status', {
                    required: { value: required, message: 'Pole jest wymagane' },
                })}
            >
                <option value="">-- Wybierz opcję --</option>
                {ContractsController.statusNames.map((statusName, index) => (
                    <option key={index} value={statusName}>
                        {statusName}
                    </option>
                ))}
            </Form.Control>
            {errors?.status && (
                <Form.Text className="text-danger">{errors.status.message as string}</Form.Text>
            )}
        </Form.Group>
    );
};

type ContractTypeSelectFormElementProps = {
    typesToInclude?: 'our' | 'other' | 'all'
    showValidationInfo?: boolean,
    required?: boolean,
    multiple?: boolean,
    name?: '_type' | '_contractType',
}

/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
export function ContractTypeSelectFormElement({
    typesToInclude = 'all',
    required = false,
    showValidationInfo = true,
    multiple = false,
    name = '_type',
}: ContractTypeSelectFormElementProps) {
    const { control, watch, setValue, formState: { errors } } = useFormContext();
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

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, '_type' | '_contractType'>) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    return (
        <Form.Group controlId={label}>
            <Form.Label>{label}</Form.Label>
            <>
                <Controller
                    name={name}
                    control={control}
                    rules={{ required: { value: required, message: 'Wybierz typ kontraktu' } }}
                    render={({ field }) => (
                        <Typeahead
                            id={`${label}-controlled`}
                            labelKey="name"
                            multiple={multiple}
                            options={makeoptions(repository.items)}
                            onChange={(items) => handleOnChange(items, field)}
                            selected={field.value ? multiple ? field.value : [field.value] : []}
                            placeholder="-- Wybierz typ --"
                            isValid={showValidationInfo ? !(errors?.[name]) : undefined}
                            isInvalid={showValidationInfo ? !!(errors?.[name]) : undefined}
                            renderMenuItemChildren={(option, props, index) => {
                                const myOption = option as RepositoryDataItem;
                                return (
                                    <div>
                                        <span>{myOption.name}</span>
                                        <div className="text-muted small">{myOption.description}</div>
                                    </div>);
                            }}
                        />
                    )}
                />
                {errors?.[name] && (
                    <Form.Text className="text-danger">
                        {errors?.[name]?.message as string}
                    </Form.Text>

                )}
            </>
        </Form.Group>
    );
}

type PersonsSelectFormElementProps = {
    label: string,
    name: string,
    repository: RepositoryReact,
    multiple?: boolean,
    showValidationInfo?: boolean,
    required?: boolean,
}
/**
 * Komponent formularza wyboru osoby
 * @param label oznaczenie pola formularza
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
export function PersonSelectFormElement({
    label,
    name,
    repository,
    multiple = false,
    showValidationInfo = true,
    required = false
}: PersonsSelectFormElementProps) {
    const { control, setValue, watch, formState: { errors } } = useFormContext();

    function makeoptions(repositoryDataItems: RepositoryDataItem[]) {
        repositoryDataItems.map(item => item._nameSurname = `${item.name} ${item.surname}`);
        return repositoryDataItems;
    }

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, string>) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    function handleSelected(field: ControllerRenderProps<any, string>) {
        const currentValue = (field.value ? multiple ? field.value : [field.value] : []) as RepositoryDataItem[];
        return makeoptions(currentValue);
    }

    return (
        <>
            <Form.Label>{label}</Form.Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Typeahead
                        id={`${label}-controlled`}
                        labelKey="_nameSurname"
                        options={makeoptions(repository.items)}
                        onChange={(items) => handleOnChange(items, field)}
                        selected={handleSelected(field)}
                        placeholder="-- Wybierz osobę --"
                        multiple={multiple}
                        isValid={showValidationInfo ? !(errors?.[name]) : undefined}
                        isInvalid={showValidationInfo ? !!(errors?.[name]) : undefined}
                    />
                )}
            />
            {errors?.[name] && (
                <Form.Text className="text-danger">
                    {errors[name]?.message as string}
                </Form.Text>
            )}
        </>
    );
}

type MyAsyncTypeaheadProps = {
    name: string
    repository: RepositoryReact,
    labelKey: string
    searchKey?: string,
    contextSearchParams?: { key: string, value: string }[],
    specialSerwerSearchActionRoute?: string
    multiple?: boolean,
    isRequired?: boolean;
    showValidationInfo?: boolean,
    renderMenuItemChildren?: RenderMenuItemChildren
}
/** Jeśli multiple jest true to wartość pola jest tablicą obiektów, jeśli false to pojedynczym obiektem
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 * @param repository repozytorium z którego pobierane są dane
 * @param labelKey nazwa pola w repozytorium które ma być wyświetlane w polu wyboru
 * @param searchKey nazwa pola w repozytorium które ma być wyszukiwane po stronie serwera (sprawdź odpowiedni controller) domyślnie jest równe labelKey
 * @param specialSerwerSearchActionRoute nazwa nietypowego route na serwerze która ma być wywołana zamiast standardowego z RepositoryReact
 * @param multiple czy pole wyboru ma być wielokrotnego wyboru 
 * @param renderMenuItemChildren funkcja renderująca elementy listy wyboru (domyślnie wyświetla tylko labelKey)  
*/
export function MyAsyncTypeahead({
    name,
    repository,
    labelKey,
    searchKey = labelKey,
    contextSearchParams = [],
    specialSerwerSearchActionRoute,
    renderMenuItemChildren = (option: any) => <>{option[labelKey]}</>,
    multiple = false,
    isRequired = false,
    showValidationInfo = true,
}: MyAsyncTypeaheadProps) {
    const { control, setValue, formState: { errors } } = useFormContext();
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    function handleSearch(query: string) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(searchKey, query);
        contextSearchParams.forEach(param => formData.append(param.key, param.value));
        repository.loadItemsfromServer(formData, specialSerwerSearchActionRoute)
            .then((items) => {
                setOptions(items);
                setIsLoading(false);
            });
    }

    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBy = () => true;

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, string>) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }
    return (
        <Controller
            name={name}
            control={control}
            rules={{ required: { value: isRequired, message: `${name} musi być wybrany` } }}
            render={({ field }) => (
                <AsyncTypeahead
                    filterBy={filterBy}
                    id="async-example"
                    isLoading={isLoading}
                    labelKey={labelKey}
                    minLength={3}
                    onSearch={handleSearch}
                    options={options}
                    onChange={(items) => handleOnChange(items, field)}
                    onBlur={field.onBlur}
                    selected={field.value ? multiple ? field.value : [field.value] : []}
                    multiple={multiple}
                    newSelectionPrefix="Dodaj nowy: "
                    placeholder="-- Wybierz opcję --"
                    renderMenuItemChildren={renderMenuItemChildren}
                    isValid={showValidationInfo ? isRequired && field.value && field.value.length > 0 : undefined}
                    isInvalid={showValidationInfo ? isRequired && (!field.value || field.value.length === 0) : undefined}
                />
            )}
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
    required?: boolean;
    showValidationInfo?: boolean;
    keyLabel?: string;
}

/**
 * Wyświetla pole do wprowadzania wartości w PLN
 * @param required czy pole jest wymagane
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji
 * @param keyLabel nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
export function ValueInPLNInput({
    showValidationInfo = true,
    keyLabel = 'value',
}: ValueInPLNInputProps) {
    const { register, control, setValue, watch, formState: { errors } } = useFormContext();
    const watchedValue = watch(keyLabel);
    const [formattedValue, setFormattedValue] = useState('');

    //potrzebne ze względu na używanie ',' zamiast '.' w formacie PLN
    useEffect(() => {
        if (watchedValue === undefined) return;
        setFormattedValue(watchedValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 }));
    }, []);

    const classNames = ['form-control'];
    if (showValidationInfo) {
        classNames.push(errors.value ? 'is-invalid' : 'is-valid');
    }

    return (
        <>
            <InputGroup className="mb-3">
                <Controller
                    control={control}
                    name={keyLabel}
                    render={({ field }) => (
                        <NumericFormat
                            {...field}
                            value={formattedValue}
                            thousandSeparator=" "
                            decimalSeparator=","
                            decimalScale={2}
                            allowLeadingZeros={false}
                            fixedDecimalScale={false}
                            displayType="input"
                            allowNegative={false}
                            onValueChange={(values: NumberFormatValues) => {
                                console.log('values: ', values);
                                setValue(keyLabel, values.floatValue)
                                field.onChange(values.value);
                            }}
                            className={classNames.join(" ")}
                            valueIsNumericString={true}
                        />
                    )}
                />
                <InputGroup.Text id="basic-addon1">PLN</InputGroup.Text>
            </InputGroup>
            {errors?.value && (
                <Form.Text className="text-danger">
                    {errors.value?.message as string}
                </Form.Text>
            )}
        </>
    );
}

export const valueValidation = Yup.string()
    .typeError('Wartość jest wymagana')
    .required('Wartość jest wymagana')
    .test('valueValidation', 'Wartość musi być mniejsza od 9 999 999 999', function (value: string | undefined) {
        if (value === undefined) return false;
        const parsedValue = parseFloat(value.replace(/[^0-9.]/g, '').replace(',', '.'));
        return parsedValue < 9999999999;
    });

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