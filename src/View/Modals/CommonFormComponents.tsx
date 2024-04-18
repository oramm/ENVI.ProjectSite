import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ButtonGroup, Form, InputGroup, ToggleButton } from "react-bootstrap";
import { AsyncTypeahead, Menu, MenuItem, Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { RenderMenuItemChildren } from "react-bootstrap-typeahead/types/components/TypeaheadMenu";
import { ControllerRenderProps, FieldErrors, FieldValues, UseFormRegister } from "react-hook-form/dist/types";
import "../../Css/styles.css";

import MainSetup from "../../React/MainSetupReact";
import RepositoryReact from "../../React/RepositoryReact";
import { useFormContext } from "./FormContext";
import { Controller } from "react-hook-form";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import * as Yup from "yup";
import { TypeaheadManagerChildProps } from "react-bootstrap-typeahead/types/types";
import {
    ApplicationCallData,
    Case,
    CaseType,
    City,
    Contract,
    ContractType,
    DocumentTemplate,
    ExternalOffer,
    FinancialAidProgrammeData,
    FocusAreaData,
    Milestone,
    MilestoneType,
    NeedData,
    OtherContract,
    OurContract,
    OurOffer,
    Person,
    Project,
    RepositoryDataItem,
} from "../../../Typings/bussinesTypes";
import { caseTypesRepository } from "../../Contracts/ContractsList/ContractsController";
import ErrorBoundary from "./ErrorBoundary";

type ProjectSelectorProps = {
    repository: RepositoryReact;
    showValidationInfo?: boolean;
    name?: string;
    disabled?: boolean;
};

/**
 * Komponent formularza wyboru projektu
 * @param repository Repozytorium projektów
 * @param showValidationInfo Czy wyświetlać informacje o walidacji - domyślnie true
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
export function ProjectSelector({
    name = "_project",
    repository,
    showValidationInfo = true,
    disabled = false,
}: ProjectSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    function renderOption(option: unknown) {
        const optionTyped = option as Project;
        return (
            <div>
                <span>{optionTyped.ourId}</span>
                <div className="text-muted small">{optionTyped.alias}</div>
            </div>
        );
    }

    return (
        <>
            <Form.Label>Projekt</Form.Label>
            <MyAsyncTypeahead
                name={name}
                labelKey="ourId"
                repository={repository}
                //specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
                showValidationInfo={showValidationInfo}
                renderMenuItemChildren={renderOption}
                multiple={false}
            />
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
                isValid={showValidationInfo ? !errors[name] : undefined}
                isInvalid={showValidationInfo ? !!errors[name] : undefined}
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

type SpecificTextOptionProps = {
    showValidationInfo?: boolean;
    name?: string;
    as?: React.ElementType;
};

export function ProjectStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ProjectStatuses).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function ContractStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ContractStatuses).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function SecurityStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.SecurityStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function OfferStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.OfferStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function OfferBidProcedureSelectFormElement({
    showValidationInfo = true,
    name = "bidProcedure",
    as,
}: SpecificTextOptionProps) {
    const options = Object.entries(MainSetup.OfferBidProcedure).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement
            options={options}
            showValidationInfo={showValidationInfo}
            name={name}
            as={as}
            label="Procedura"
        />
    );
}

export function OfferFormSelectFormElement({ showValidationInfo = true, name = "form", as }: SpecificTextOptionProps) {
    const options = Object.entries(MainSetup.OfferForm).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement
            options={options}
            showValidationInfo={showValidationInfo}
            name={name}
            as={as}
            label="Forma wysyłki"
        />
    );
}

export function TaksStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    let statuses = Object.entries(MainSetup.TaskStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function InvoiceStatusSelectFormElement({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.InvoiceStatuses).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function ApplicationCallStatusSelector({
    showValidationInfo = true,
    name = "status",
    as,
}: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ApplicationCallStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export function ClientNeedStatusSelector({ showValidationInfo = true, name = "status", as }: SpecificTextOptionProps) {
    const statuses = Object.entries(MainSetup.ClientNeedStatus).map(([key, value]) => value);
    return (
        <SelectTextOptionFormElement options={statuses} showValidationInfo={showValidationInfo} name={name} as={as} />
    );
}

export type CitySelectFormElementProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    repository: RepositoryReact;
    allowNew?: boolean;
};

export function CitySelectFormElement({
    name = "_city",
    showValidationInfo = true,
    multiple = false,
    repository,
    allowNew = false,
}: CitySelectFormElementProps) {
    const {
        formState: { errors },
    } = useFormContext();

    function renderOption(option: any) {
        //console.log("renderOption - Option: ", option); // Log the option being rendered

        return (
            <div>
                <span>{option.name}</span>
                <div className="text-muted small">{option.code}</div>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="name"
                searchKey="searchText"
                repository={repository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

export type OfferSelectFormElementProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    repository: RepositoryReact;
    readOnly?: boolean;
};

export function OfferSelectFormElement({
    name = "_offer",
    showValidationInfo = true,
    multiple = false,
    repository,
    readOnly = false,
}: OfferSelectFormElementProps) {
    const {
        formState: { errors },
    } = useFormContext();

    function renderOption(option: any) {
        const typedOption = option as OurOffer | ExternalOffer;
        return (
            <div>
                <span>
                    {typedOption._type.name} {` `}
                    {typedOption._city.name} {` | `}
                    {typedOption.alias} {` | `}
                    {typedOption.submissionDeadline}
                </span>
                <div className="text-muted small">{typedOption.employerName}</div>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="alias"
                searchKey="searchText"
                repository={repository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                showValidationInfo={showValidationInfo}
                readOnly={readOnly}
            />
        </>
    );
}

export type FinancialAidProgrammeSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    repository: RepositoryReact;
    allowNew?: boolean;
};

export function FinancialAidProgrammeSelector({
    name = "_financialAidProgramme",
    showValidationInfo = true,
    multiple = false,
    repository,
    allowNew = false,
}: FinancialAidProgrammeSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    function renderOption(option: any) {
        const optionTyped = option as FinancialAidProgrammeData;
        return (
            <div>
                <span>{optionTyped.name}</span>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="name"
                searchKey="searchText"
                repository={repository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

export type FocusAreaSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    repository: RepositoryReact;
    allowNew?: boolean;
    _financialAidProgramme?: FinancialAidProgrammeData;
};

export function FocusAreaSelector({
    name = "_focusArea",
    showValidationInfo = true,
    multiple = false,
    repository,
    allowNew = false,
    _financialAidProgramme,
}: FocusAreaSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    function renderOption(option: any) {
        const optionTyped = option as FocusAreaData;
        return (
            <div>
                <span>{optionTyped.name}</span>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="name"
                searchKey="searchText"
                contextSearchParams={{
                    _financialAidProgramme,
                }}
                repository={repository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

export type ApplicationCallSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    repository: RepositoryReact;
    allowNew?: boolean;
    _financialAidProgramme?: FinancialAidProgrammeData;
    _focusArea?: FocusAreaData | FocusAreaData[];
};

export function ApplicationCallSelector({
    name = "_applicationCall",
    showValidationInfo = true,
    multiple = false,
    repository,
    allowNew = false,
    _financialAidProgramme,
    _focusArea,
}: ApplicationCallSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    function renderOption(option: unknown) {
        const optionTyped = option as ApplicationCallData;
        console.log("renderOption - Option: ", option); // Log the option being rendered
        return (
            <div>
                <span>{optionTyped.description}</span>
                <div className="text-muted small">
                    {optionTyped.endDate} {optionTyped.status}
                </div>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="description"
                searchKey="searchText"
                contextSearchParams={{
                    _financialAidProgramme,
                    _focusArea,
                }}
                repository={repository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

export type ClientNeedSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    repository: RepositoryReact;
    allowNew?: boolean;
};

export function ClientNeedSelector({
    name = "_need",
    showValidationInfo = true,
    multiple = false,
    repository,
    allowNew = false,
}: ClientNeedSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    function renderOption(option: any) {
        const optionTyped = option as NeedData;
        return (
            <div>
                <span>{optionTyped.name}</span>
                <div className="text-muted small">
                    {optionTyped._client?.name} | {optionTyped.status}
                </div>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="name"
                searchKey="searchText"
                repository={repository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

export type ContractSelectFormElementProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    typesToInclude?: "our" | "other" | "all";
    repository: RepositoryReact;
    _project?: Project;
    readOnly?: boolean;
};

export function ContractSelectFormElement({
    name = "_contract",
    showValidationInfo = true,
    multiple = false,
    repository,
    typesToInclude = "all",
    _project,
    readOnly = false,
}: ContractSelectFormElementProps) {
    const {
        formState: { errors },
    } = useFormContext();

    function renderOption(option: unknown) {
        const optionTyped = option as OurContract | OtherContract;
        const mainLabel = "ourId" in optionTyped ? optionTyped.ourId : optionTyped.number;
        return (
            <div>
                <span>{mainLabel}</span>
                <div className="text-muted small">{optionTyped.alias || optionTyped.name}</div>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="_ourIdOrNumber_Name"
                searchKey="searchText"
                contextSearchParams={{
                    typesToInclude: typesToInclude,
                    _project: _project,
                }}
                repository={repository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                showValidationInfo={showValidationInfo}
                readOnly={readOnly}
            />
        </>
    );
}

type ContractTypeSelectFormElementProps = {
    typesToInclude?: "our" | "other" | "all";
    showValidationInfo?: boolean;
    required?: boolean;
    multiple?: boolean;
    name?: "_type" | "_contractType";
};

/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
export function ContractTypeSelectFormElement({
    typesToInclude = "all",
    required = false,
    showValidationInfo = true,
    multiple = false,
    name = "_type",
}: ContractTypeSelectFormElementProps) {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const label = "Typ Kontraktu";
    const repository = MainSetup.contractTypesRepository;

    function makeoptions(repositoryDataItems: ContractType[]) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (typesToInclude === "all") return true;
            if (typesToInclude === "our" && item.isOur) return true;
            if (typesToInclude === "other" && !item.isOur) return true;
            return false;
        });
        return filteredItems;
    }

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, typeof name>) {
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
                    rules={{ required: { value: required, message: "Wybierz typ kontraktu" } }}
                    render={({ field }) => (
                        <Typeahead
                            id={`${label}-controlled`}
                            labelKey="name"
                            multiple={multiple}
                            options={makeoptions(repository.items)}
                            onChange={(items) => handleOnChange(items, field)}
                            selected={field.value ? (multiple ? field.value : [field.value]) : []}
                            placeholder="-- Wybierz typ --"
                            isValid={showValidationInfo ? !errors?.[name] : undefined}
                            isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                            renderMenuItemChildren={(option, props, index) => {
                                const optionTyped = option as ContractType;
                                return (
                                    <div>
                                        <span>{optionTyped.name}</span>
                                        <div className="text-muted small">{optionTyped.description}</div>
                                    </div>
                                );
                            }}
                        />
                    )}
                />
                <ErrorMessage errors={errors} name={name} />
            </>
        </Form.Group>
    );
}

type CaseTypeSelectFormElementProps = {
    milestoneType?: MilestoneType;
    showValidationInfo?: boolean;
    required?: boolean;
    multiple?: boolean;
    name?: "_type" | "_caseType";
};

/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
export function CaseTypeSelectFormElement({
    milestoneType,
    required = false,
    showValidationInfo = true,
    multiple = false,
    name = "_type",
}: CaseTypeSelectFormElementProps) {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const label = "Typ Sprawy";
    const repository = caseTypesRepository;

    function makeoptions(repositoryDataItems: CaseType[]) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (!milestoneType) return true;
            if (milestoneType.id === item._milestoneType.id) return true;
            return false;
        });
        return filteredItems;
    }

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, typeof name>) {
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
                    rules={{ required: { value: required, message: "Wybierz typ sprawy" } }}
                    render={({ field }) => (
                        <Typeahead
                            id={`${label}-controlled`}
                            labelKey="name"
                            multiple={multiple}
                            options={makeoptions(repository.items)}
                            onChange={(items) => handleOnChange(items, field)}
                            selected={field.value ? (multiple ? field.value : [field.value]) : []}
                            placeholder="-- Wybierz typ --"
                            isValid={showValidationInfo ? !errors?.[name] : undefined}
                            isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                            renderMenuItemChildren={(option, props, index) => {
                                const myOption = option as CaseType;
                                return (
                                    <div>
                                        <span>{myOption.name}</span>
                                        <div className="text-muted small">{myOption.description}</div>
                                    </div>
                                );
                            }}
                        />
                    )}
                />
                <ErrorMessage errors={errors} name={name} />
            </>
        </Form.Group>
    );
}

type OurLetterTemplateSelectFormElementProps = {
    showValidationInfo?: boolean;
    _cases: Case[];
};

/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
export function OurLetterTemplateSelectFormElement({
    showValidationInfo = true,
    _cases = [],
}: OurLetterTemplateSelectFormElementProps) {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const name = "_template";
    const label = "Szablon pisma";
    const repository = MainSetup.documentTemplatesRepository;

    function makeoptions(templates: DocumentTemplate[]) {
        const filteredTemplates = templates.filter((template) => {
            return (
                !template._contents.caseTypeId ||
                _cases.some((caseItem) => caseItem._type.id === template._contents.caseTypeId)
            );
        });
        return filteredTemplates;
    }

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, typeof name>) {
        const valueToBeSent = selectedOptions[0];
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
                    render={({ field }) => (
                        <Typeahead
                            id={`${label}-controlled`}
                            labelKey="name"
                            multiple={false}
                            options={makeoptions(repository.items)}
                            onChange={(items) => handleOnChange(items, field)}
                            selected={field.value ? [field.value] : []}
                            placeholder="-- Wybierz szablon --"
                            isValid={showValidationInfo ? !errors?.[name] : undefined}
                            isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                            renderMenuItemChildren={(option, props, index) => {
                                const myOption = option as DocumentTemplate;
                                return (
                                    <div>
                                        <span>{myOption._nameContentsAlias}</span>
                                        <div className="text-muted small">{myOption.description}</div>
                                    </div>
                                );
                            }}
                        />
                    )}
                />
                <ErrorMessage errors={errors} name={name} />
            </>
        </Form.Group>
    );
}

type PersonsSelectFormElementProps = {
    label: string;
    name: string;
    repository: RepositoryReact<Person>;
    multiple?: boolean;
    showValidationInfo?: boolean;
};
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
}: PersonsSelectFormElementProps) {
    const {
        control,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext();

    function makeoptions(repositoryDataItems: (Person & { _nameSurname: string })[]) {
        repositoryDataItems.map((item) => (item._nameSurname = `${item.name} ${item.surname}`));
        return repositoryDataItems;
    }

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, string>) {
        const valueToBeSent = selectedOptions.length > 0 ? (multiple ? selectedOptions : selectedOptions[0]) : null;
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    function handleSelected(field: ControllerRenderProps<any, string>) {
        const currentValue = (field.value ? (multiple ? field.value : [field.value]) : []) as (Person & {
            _nameSurname: string;
        })[];
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
                        options={makeoptions(repository.items as (Person & { _nameSurname: string })[])}
                        onChange={(items) => handleOnChange(items, field)}
                        selected={handleSelected(field)}
                        placeholder="-- Wybierz osobę --"
                        multiple={multiple}
                        isValid={showValidationInfo ? !errors?.[name] : undefined}
                        isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                    />
                )}
            />
            <ErrorMessage errors={errors} name={name} />
        </>
    );
}

export type ErrorMessageProps = { errors: FieldErrors<any>; name: string };
export function ErrorMessage({ errors, name }: ErrorMessageProps) {
    return <>{errors[name] && <Form.Text className="text-danger">{errors[name]?.message as string}</Form.Text>}</>;
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

function groupByMilestone(cases: Case[]) {
    return cases.reduce<Record<string, Case[]>>((groups, item) => {
        const key = item._parent._FolderNumber_TypeName_Name ?? "Brak danych";
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

function renderCaseMenu(
    results: Case[],
    menuProps: any,
    state: TypeaheadManagerChildProps,
    groupedResults: Record<string, Case[]>,
    milestoneNames: string[]
) {
    let index = 0;

    const items = milestoneNames.map((milestoneName) => (
        <Fragment key={milestoneName}>
            {index !== 0 && <Menu.Divider />}
            <Menu.Header>{milestoneName}</Menu.Header>
            {groupedResults[milestoneName].map((item) => {
                const menuItem = (
                    <MenuItem key={index} option={item} position={index}>
                        {item._type.folderNumber} {item._type.name} {item._folderName}
                    </MenuItem>
                );

                index += 1;
                return menuItem;
            })}
        </Fragment>
    ));

    return <Menu {...menuProps}>{items}</Menu>;
}

interface CaseSelectMenuElementProps {
    name?: string;
    repository: RepositoryReact<Case>;
    _project?: Project;
    _contract?: Contract;
    _offer?: OurOffer | ExternalOffer;
    _milestone?: Milestone;
    readonly?: boolean;
    showValidationInfo?: boolean;
    multiple?: boolean;
}

/**
 * Pole wyboru sprawy z repozytorium pogrupowane po Milestonach
 * @param name nazwa pola formularza (musi być zgodna z nazwą pola w obiekcie)
 * @param repository repozytorium z którego pobierane są dane
 * @param multiple czy można wybrać wiele opcji
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji (domyślnie true)
 * @param readOnly czy pole jest tylko do odczytu (domyślnie false)
 * @param _contract kontrakt do którego należy wybrana sprawa
 */

export function CaseSelectMenuElement({
    name = "_case",
    readonly = false,
    _contract,
    _offer,
    repository,
    showValidationInfo = true,
    multiple = true,
}: CaseSelectMenuElementProps) {
    const [options, setOptions] = useState<any[]>([]);

    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext();

    useEffect(() => {
        const fetchData = async () => {
            if (_contract) {
                await repository.loadItemsFromServerPOST([
                    { contractId: _contract.id, milestoneParentType: "CONTRACT" },
                ]);
                setOptions(repository.items);
            } else if (_offer) {
                await repository.loadItemsFromServerPOST([{ offerId: _offer.id, milestoneParentType: "OFFER" }]);
                setOptions(repository.items);
            } else {
                repository.clearData();
            }
        };
        fetchData();
    }, [_contract, _offer]);

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, string>) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Typeahead
                    id={`${name}-typeahead`}
                    labelKey="_typeFolderNumber_TypeName_Number_Name"
                    multiple={multiple}
                    options={options}
                    onChange={(items) => handleOnChange(items, field)}
                    renderMenu={(results, menuProps, state) => {
                        const groupedResults = groupByMilestone(results as Case[]);
                        const milestoneNames = Object.keys(groupedResults).sort();
                        return renderCaseMenu(results as Case[], menuProps, state, groupedResults, milestoneNames);
                    }}
                    selected={field.value ? (multiple ? field.value : [field.value]) : []}
                    placeholder="-- Wybierz sprawę --"
                    isValid={showValidationInfo ? !errors?.[name] : undefined}
                    isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                    renderMenuItemChildren={(option, props, index) => {
                        const myOption = option as Case;
                        return (
                            <div>
                                <span>{myOption._typeFolderNumber_TypeName_Number_Name}</span>
                                <div className="text-muted small">{myOption.description}</div>
                            </div>
                        );
                    }}
                />
            )}
        />
    );
}

type ValueInPLNInputProps = {
    showValidationInfo?: boolean;
    keyLabel?: string;
};

/**
 * Wyświetla pole do wprowadzania wartości w PLN
 * @param showValidationInfo czy wyświetlać informacje o błędzie walidacji (domyślnie true)
 * @param keyLabel nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie 'value')
 */
export function ValueInPLNInput({ showValidationInfo = true, keyLabel = "value" }: ValueInPLNInputProps) {
    const {
        control,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext();
    const watchedValue = watch(keyLabel);

    useEffect(() => {
        if (watchedValue !== undefined) {
            setValue(keyLabel, watchedValue, { shouldValidate: true });
        } else {
            setValue(keyLabel, "", { shouldValidate: true });
        }
    }, [watchedValue, setValue]);

    const classNames = ["form-control"];
    if (showValidationInfo) {
        classNames.push(errors[keyLabel] ? "is-invalid" : "is-valid");
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
                            value={watchedValue}
                            thousandSeparator=" "
                            decimalSeparator="."
                            decimalScale={2}
                            allowLeadingZeros={false}
                            fixedDecimalScale={true}
                            displayType="input"
                            allowNegative={false}
                            onValueChange={(values: NumberFormatValues) => {
                                setValue(keyLabel, values.floatValue);
                                //field.onChange(values.floatValue);
                            }}
                            className={classNames.join(" ")}
                            valueIsNumericString={false}
                        />
                    )}
                />
                <InputGroup.Text id="basic-addon1">PLN</InputGroup.Text>
            </InputGroup>
            <ErrorMessage name={keyLabel} errors={errors} />
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
