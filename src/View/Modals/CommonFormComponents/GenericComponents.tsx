import React, { forwardRef, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ButtonGroup, Col, Form, InputGroup, ToggleButton } from "react-bootstrap";
import { AsyncTypeahead, Menu, MenuItem, Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "../../../Css/styles.css";

import RepositoryReact from "../../../React/RepositoryReact";
import { useFormContext } from "../FormContext";
import { Controller, ControllerRenderProps, FieldErrors, useForm } from "react-hook-form";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import * as Yup from "yup";
import { TypeaheadManagerChildProps } from "react-bootstrap-typeahead/types/types";
import { RenderMenuItemChildren } from "react-bootstrap-typeahead/types/components/TypeaheadMenu";
import { hasError } from "../../Resultsets/CommonComponentsController";
import { ColProps } from "react-bootstrap";
import { yupResolver } from "@hookform/resolvers/yup";

export type ErrorMessageProps = { errors: FieldErrors<any>; name: string };
export function ErrorMessage1({ errors, name }: ErrorMessageProps) {
    return <>{errors[name] && <Form.Text className="text-danger">{errors[name]?.message as string}</Form.Text>}</>;
}

export function ErrorMessage({ errors, name }: ErrorMessageProps) {
    // Function to access nested properties
    const getNestedError = (errors: any, path: string): any => {
        const keys = path.split("."); // Split the path into keys
        let current = errors;
        for (let key of keys) {
            if (current[key]) {
                current = current[key];
            } else {
                return null; // If the path does not exist, return null
            }
        }
        return current;
    };

    const error = getNestedError(errors, name);

    return <>{error && <Form.Text className="text-danger">{error.message}</Form.Text>}</>;
}

type MyAsyncTypeaheadProps = {
    name: string;
    repository: RepositoryReact;
    labelKey: string;
    searchKey?: string;
    contextSearchParams?: any;
    specialSerwerSearchActionRoute?: string;
    multiple?: boolean;
    allowNew?: boolean;
    showValidationInfo?: boolean;
    renderMenuItemChildren?: RenderMenuItemChildren;
    renderMenu?: (results: any[], menuProps: any, state: TypeaheadManagerChildProps) => JSX.Element;
    readOnly?: boolean;
};
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
    contextSearchParams = {},
    specialSerwerSearchActionRoute,
    renderMenuItemChildren = (option: any) => <>{option[labelKey]}</>,
    renderMenu,
    multiple = false,
    allowNew = false,
    showValidationInfo = true,
    readOnly = false,
}: MyAsyncTypeaheadProps) {
    const {
        register,
        control,
        setValue,
        formState: { errors },
    } = useFormContext();
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    function handleSearch(query: string) {
        //console.log("handleSearch - Query: ", query); // Log the search query
        setIsLoading(true);
        const params = {
            [searchKey]: query,
            ...contextSearchParams,
        };
        repository.loadItemsFromServerPOST([params], specialSerwerSearchActionRoute).then((items) => {
            setOptions(items);
            setIsLoading(false);
            if (items.length > 0 && !(labelKey in items[0]))
                throw new Error(`Nie znaleziono pola ${labelKey} w obiekcie zwróconym przez serwer`);
        });
    }

    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBy = () => true;

    function handleOnChange(selectedOptions: any[], field: ControllerRenderProps<any, string>) {
        let valueToBeSent;
        if (selectedOptions.length > 0) {
            if (selectedOptions[0].customOption) {
                // Nowa wartość wprowadzona przez użytkownika
                valueToBeSent = multiple ? selectedOptions.map((opt) => opt[labelKey]) : selectedOptions[0][labelKey];
            } else {
                // Wybrana wartość z listy
                valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
            }
        } else {
            valueToBeSent = null;
        }
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    return (
        <>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    //console.log("Rendering AsyncTypeahead - Field Value: ", field.value);
                    return (
                        <AsyncTypeahead
                            renderMenu={renderMenu ? renderMenu : undefined}
                            filterBy={filterBy}
                            id={`${name}-asyncTypeahead`}
                            allowNew={allowNew}
                            isLoading={isLoading}
                            labelKey={labelKey}
                            minLength={2}
                            onSearch={handleSearch}
                            options={options}
                            onChange={(items) => handleOnChange(items, field)}
                            onBlur={field.onBlur}
                            selected={field.value ? (multiple ? field.value : [field.value]) : []}
                            multiple={multiple}
                            newSelectionPrefix="Dodaj nowy: "
                            placeholder="-- Wybierz opcję --"
                            renderMenuItemChildren={renderMenuItemChildren}
                            isValid={showValidationInfo ? !errors?.[name] : undefined}
                            isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                        />
                    );
                }}
            />
            <ErrorMessage errors={errors} name={name} />
            {readOnly && <input type="hidden" {...register(name)} />}
        </>
    );
}

type SelectTextOptionFormElementProps = {
    showValidationInfo?: boolean;
    options: string[];
    name: string;
    as?: React.ElementType;
    label?: string;
};

export function SelectTextOptionFormElement({
    options,
    showValidationInfo = true,
    name,
    as,
    label = name,
}: SelectTextOptionFormElementProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    function makeLabel() {
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    return (
        <Form.Group controlId={name} as={as}>
            <Form.Label>{makeLabel()}</Form.Label>
            <Form.Control
                as="select"
                isValid={showValidationInfo ? !hasError(errors, name) : undefined}
                isInvalid={showValidationInfo ? hasError(errors, name) : undefined}
                {...register(name)}
            >
                <option value="">-- Wybierz opcję --</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </Form.Control>
            <ErrorMessage errors={errors} name={name} />
        </Form.Group>
    );
}

export type SpecificTextOptionProps = {
    showValidationInfo?: boolean;
    name?: string;
    as?: React.ElementType;
};

type ValueInPLNInputProps = {
    showValidationInfo?: boolean;
    name?: string;
};

/**
 * Wyświetla pole do wprowadzania wartości w PLN
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji (domyślnie true)
 * @param keyLabel nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie 'value')
 */
export function ValueInPLNInput({ showValidationInfo = true, name = "value" }: ValueInPLNInputProps) {
    const {
        control,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext();
    const watchedValue = watch(name);

    useEffect(() => {
        setValue(name, watchedValue ?? "", { shouldValidate: true });
    }, [watchedValue, setValue]);

    const classNames = ["form-control"];
    if (showValidationInfo) {
        classNames.push(hasError(errors, name) ? "is-invalid" : "is-valid");
    }

    return (
        <>
            <InputGroup className="mb-3">
                <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                        <NumericFormat
                            {...field}
                            value={watchedValue}
                            thousandSeparator=" "
                            decimalSeparator="."
                            decimalScale={2}
                            allowLeadingZeros={false}
                            fixedDecimalScale={true}
                            displayType="input"
                            allowNegative={false}
                            onValueChange={(values: NumberFormatValues) => {
                                setValue(name, values.floatValue);
                                //field.onChange(values.floatValue);
                            }}
                            className={classNames.join(" ")}
                            valueIsNumericString={false}
                        />
                    )}
                />
                <InputGroup.Text id="basic-addon1">PLN</InputGroup.Text>
            </InputGroup>
            <ErrorMessage name={name} errors={errors} />
        </>
    );
}

export const valueValidation = Yup.string()
    .typeError("Wartość jest wymagana")
    .required("Wartość jest wymagana")
    .test("valueValidation", "Wartość musi być mniejsza od 9 999 999 999", function (value: string | undefined) {
        if (value === undefined) return false;
        const parsedValue = parseFloat(value.replace(/[^0-9.]/g, "").replace(",", "."));
        return parsedValue < 9999999999;
    });

type DateRangeInputProps = ColProps & {
    showValidationInfo?: boolean;
    fromName: string;
    toName: string;
    defaultFromValue?: string;
    defaultToValue?: string;
    label: string;
};

export const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
    ({ showValidationInfo = true, fromName, toName, label, defaultFromValue, defaultToValue, ...colProps }, ref) => {
        const {
            control,
            setValue,
            watch,
            formState: { errors },
        } = useFormContext();

        const watchedFromValue = watch(fromName, defaultFromValue ?? "");
        const watchedToValue = watch(toName, defaultToValue ?? "");

        useEffect(() => {
            setValue(fromName, watchedFromValue ?? "", { shouldValidate: true });
            setValue(toName, watchedToValue ?? "", { shouldValidate: true });
        }, [watchedFromValue, watchedToValue, setValue]);

        const getClassName = (name: string) => {
            const classNames = ["form-control"];
            if (showValidationInfo) {
                classNames.push(hasError(errors, name) ? "is-invalid" : "is-valid");
            }
            return classNames.join(" ");
        };

        const hasError = (errors: any, name: string) => {
            return errors && errors[name];
        };

        return (
            <Form.Group as={Col} ref={ref} {...colProps}>
                <Form.Label>{label}</Form.Label>
                <InputGroup>
                    <InputGroup.Text id="date-from-label">Od</InputGroup.Text>
                    <Controller
                        control={control}
                        name={fromName}
                        render={({ field }) => (
                            <Form.Control
                                {...field}
                                type="date"
                                value={watchedFromValue}
                                onChange={(e) => setValue(fromName, e.target.value, { shouldValidate: true })}
                                className={getClassName(fromName)}
                            />
                        )}
                    />
                    <InputGroup.Text id="date-to-label">Do</InputGroup.Text>
                    <Controller
                        control={control}
                        name={toName}
                        render={({ field }) => (
                            <Form.Control
                                {...field}
                                type="date"
                                value={watchedToValue}
                                onChange={(e) => setValue(toName, e.target.value, { shouldValidate: true })}
                                className={getClassName(toName)}
                            />
                        )}
                    />
                </InputGroup>
                <ErrorMessage name={fromName} errors={errors} />
                <ErrorMessage name={toName} errors={errors} />
            </Form.Group>
        );
    }
);

type FileInputProps = {
    name: string;
    required?: boolean;
    acceptedFileTypes?: string;
    multiple?: boolean;
};

export function FileInput({ name, required = false, acceptedFileTypes = "", multiple = true }: FileInputProps) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    return (
        <>
            <Controller
                control={control}
                name={name}
                defaultValue={[]}
                //render={({ field: { onChange } }) => (
                render={({ field: { value, onChange, ...field } }) => (
                    <Form.Control
                        type="file"
                        value={value?.fileName}
                        required={required}
                        accept={acceptedFileTypes}
                        isInvalid={!!errors[name]}
                        isValid={!errors[name]}
                        multiple={multiple}
                        onChange={(event) => {
                            const files = (event.target as HTMLInputElement).files;

                            onChange(files);
                        }}
                    />
                )}
            />
            <ErrorMessage name={name} errors={errors} />
        </>
    );
}

interface RadioButtonGroupProps {
    name: string;
    options: { name: string; value: string }[];
}

export function RadioButtonGroup({ name, options }: RadioButtonGroupProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={options[0].value}
            rules={{ required: true }}
            render={({ field }) => (
                <ButtonGroup>
                    {options.map((radio, idx) => (
                        <ToggleButton
                            key={idx}
                            id={`radio-${idx}`}
                            type="radio"
                            variant={"outline-secondary"}
                            name="radio"
                            value={radio.value}
                            checked={field.value === radio.value}
                            onChange={() => field.onChange(radio.value)}
                        >
                            {radio.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
            )}
        />
    );
}
