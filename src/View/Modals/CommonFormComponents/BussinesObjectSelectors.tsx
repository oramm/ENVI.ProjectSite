import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ButtonGroup, Form, InputGroup, ToggleButton } from "react-bootstrap";
import { Menu, MenuItem, Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { ControllerRenderProps, FieldErrors, FieldValues, UseFormRegister } from "react-hook-form/dist/types";
import "../../../Css/styles.css";

import MainSetup from "../../../React/MainSetupReact";
import RepositoryReact from "../../../React/RepositoryReact";
import { useFormContext } from "../FormContext";
import { Controller } from "react-hook-form";
import { TypeaheadManagerChildProps } from "react-bootstrap-typeahead/types/types";
import {
    ApplicationCallData,
    Case,
    CaseType,
    CityData,
    Contract,
    ContractRangeData,
    ContractType,
    DocumentTemplate,
    EntityData,
    ExternalOffer,
    FinancialAidProgrammeData,
    FocusAreaData,
    IncomingLetterContract,
    MilestoneData,
    MilestoneType,
    NeedData,
    OtherContract,
    OurContract,
    OurLetterContract,
    OurOffer,
    PersonData,
    ProjectData,
    SkillDictionaryRecord,
} from "../../../../Typings/bussinesTypes";
import { caseTypesRepository, milestoneTypesRepository } from "../../../Contracts/ContractsList/ContractsController";
import { ErrorMessage, MyAsyncTypeahead } from "./GenericComponents";
import { safeGetFirstField, ensureLabelKey } from "../../../React/Tools/ToolsForms";

type ProjectSelectorProps = {
    showValidationInfo?: boolean;
    name?: string;
    disabled?: boolean;
};

/**
 * Komponent formularza wyboru projektu
 * @param showValidationInfo Czy wyświetlać informacje o walidacji - domyślnie true
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
export function ProjectSelector({
    name = "_project",
    showValidationInfo = true,
    disabled = false,
}: ProjectSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<ProjectData>({
                actionRoutes: {
                    getRoute: "projects",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "projectSelector_temp",
            }),
        []
    );

    function renderOption(option: unknown) {
        const optionTyped = option as ProjectData;
        // ourId jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const alias = safeGetFirstField<string>(optionTyped, ["alias"], "[Brak aliasu]");

        return (
            <div>
                <span>{optionTyped.ourId}</span>
                <div className="text-muted small text-wrap">{alias}</div>
            </div>
        );
    }

    return (
        <>
            <Form.Label>Projekt</Form.Label>
            <MyAsyncTypeahead
                name={name}
                labelKey="ourId"
                repository={localRepository}
                //specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
                showValidationInfo={showValidationInfo}
                renderMenuItemChildren={renderOption}
                multiple={false}
            />
        </>
    );
}

export type CitySelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    allowNew?: boolean;
};

export function CitySelector({
    name = "_city",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
}: CitySelectorProps) {
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<CityData>({
                actionRoutes: {
                    getRoute: "cities",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "citySelector_temp",
            }),
        []
    );

    function renderOption(option: any) {
        const typedOption = option as CityData;
        // name jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const code = safeGetFirstField<string>(typedOption, ["code"], "");

        return (
            <div>
                <span>{typedOption.name}</span>
                <span className="text-muted small"> {code}</span>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="name"
                searchKey="searchText"
                repository={localRepository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

export type EntitySelectorProps = {
    name: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    allowNew?: boolean;
    repository?: RepositoryReact<EntityData>;
};

export function EntitySelector({
    name,
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    repository,
}: EntitySelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // ✅ Lokalna instancja repository tylko dla tego selectora (lub użyj przekazanego)
    const localRepository = useMemo(() => {
        if (repository) return repository;
        return new RepositoryReact<EntityData>({
            actionRoutes: {
                getRoute: "entities",
                addNewRoute: "",
                editRoute: "",
                deleteRoute: "",
            },
            name: "entitySelector_temp",
        });
    }, [repository]);

    function renderOption(option: any, props: any) {
        const typedOption = option as EntityData;
        // name jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const address = safeGetFirstField<string>(typedOption, ["address"], "[Brak adresu]");

        return (
            <div>
                <span>{typedOption.name}</span>
                <div className="text-muted small text-wrap">{address}</div>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="name"
                searchKey="searchText"
                repository={localRepository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

export type OfferSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    readOnly?: boolean;
};

export function OfferSelector({
    name = "_offer",
    showValidationInfo = true,
    multiple = false,
    readOnly = false,
}: OfferSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<OurOffer | ExternalOffer>({
                actionRoutes: {
                    getRoute: "offers",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "offerSelector_temp",
            }),
        []
    );

    function renderOption(option: any) {
        const typedOption = option as OurOffer | ExternalOffer;
        // alias jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const typeName = safeGetFirstField<string>(typedOption, ["_type.name"], "[Brak typu]");
        const cityName = safeGetFirstField<string>(typedOption, ["_city.name"], "");
        const deadline = safeGetFirstField<string>(typedOption, ["submissionDeadline"], "");
        const employerName = safeGetFirstField<string>(typedOption, ["employerName"], "[Brak pracodawcy]");

        return (
            <div>
                <span>
                    {typeName} {` `}
                    {cityName} {` | `}
                    {typedOption.alias} {` | `}
                    {deadline}
                </span>
                <div className="text-muted small text-wrap">{employerName}</div>
            </div>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="alias"
                searchKey="searchText"
                repository={localRepository}
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
    allowNew?: boolean;
    repository?: RepositoryReact<FinancialAidProgrammeData>;
};

export function FinancialAidProgrammeSelector({
    name = "_financialAidProgramme",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    repository,
}: FinancialAidProgrammeSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // ✅ Lokalna instancja repository tylko dla tego selectora (lub użyj przekazanego)
    const localRepository = useMemo(() => {
        if (repository) return repository;
        return new RepositoryReact<FinancialAidProgrammeData>({
            actionRoutes: {
                getRoute: "financialAidProgrammes",
                addNewRoute: "",
                editRoute: "",
                deleteRoute: "",
            },
            name: "financialAidProgrammeSelector_temp",
        });
    }, [repository]);

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
                repository={localRepository}
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
    allowNew?: boolean;
    _financialAidProgramme?: FinancialAidProgrammeData;
};

export function FocusAreaSelector({
    name = "_focusArea",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    _financialAidProgramme,
}: FocusAreaSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<FocusAreaData>({
                actionRoutes: {
                    getRoute: "focusAreas",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "focusAreaSelector_temp",
            }),
        []
    );

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
                repository={localRepository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

type FocusAreaSelector1Props = {
    repository: RepositoryReact<FocusAreaData>;
    _financialAidProgramme: FinancialAidProgrammeData;
    showValidationInfo?: boolean;
    required?: boolean;
    multiple?: boolean;
    name?: string;
};

/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
export function FocusAreaSelectorPreloaded({
    repository,
    _financialAidProgramme,
    required = false,
    showValidationInfo = true,
    multiple = false,
    name = "_focusArea",
}: FocusAreaSelector1Props) {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const [options, setOptions] = useState<any[]>([]);

    const label = "Działanie";

    useEffect(() => {
        const fetchData = async () => {
            if (_financialAidProgramme) await repository.loadItemsFromServerPOST([{ _financialAidProgramme }]);
            else repository.clearData();
            setOptions(repository.items);
            setValue(name, multiple ? [] : null);
        };
        fetchData();
    }, [_financialAidProgramme]);

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, typeof name>) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    return (
        <Form.Group controlId={name}>
            <Form.Label>{label}</Form.Label>
            <>
                <Controller
                    name={name}
                    control={control}
                    rules={{ required: { value: required, message: "Wybierz działanie" } }}
                    render={({ field }) => (
                        <Typeahead
                            id={`${name}-controlled`}
                            labelKey="name"
                            multiple={multiple}
                            options={options}
                            onChange={(items) => handleOnChange(items, field)}
                            selected={field.value ? (multiple ? field.value : [field.value]) : []}
                            placeholder="-- Wybierz działanie --"
                            isValid={showValidationInfo ? !errors?.[name] : undefined}
                            isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                            renderMenuItemChildren={(option, props, index) => {
                                const optionTyped = option as FocusAreaData;
                                return (
                                    <div>
                                        <span>{optionTyped.alias}</span>
                                        <div className="text-muted small text-wrap">{optionTyped.name}</div>
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

export type ApplicationCallSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    allowNew?: boolean;
    _financialAidProgramme?: FinancialAidProgrammeData;
    _focusArea?: FocusAreaData | FocusAreaData[];
};

export function ApplicationCallSelector({
    name = "_applicationCall",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    _financialAidProgramme,
    _focusArea,
}: ApplicationCallSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<ApplicationCallData>({
                actionRoutes: {
                    getRoute: "applicationCalls",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "applicationCallSelector_temp",
            }),
        []
    );

    function renderOption(option: unknown) {
        const optionTyped = option as ApplicationCallData;
        // description jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const endDate = safeGetFirstField<string>(optionTyped, ["endDate"], "");
        const status = safeGetFirstField<string>(optionTyped, ["status"], "");

        return (
            <div>
                <span>{optionTyped.description}</span>
                <div className="text-muted small text-wrap">
                    {endDate} {status}
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
                repository={localRepository}
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
    allowNew?: boolean;
};

export function ClientNeedSelector({
    name = "_need",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
}: ClientNeedSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<NeedData>({
                actionRoutes: {
                    getRoute: "needs",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "clientNeedSelector_temp",
            }),
        []
    );

    function renderOption(option: any) {
        const optionTyped = option as NeedData;
        // name jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const clientName = safeGetFirstField<string>(optionTyped, ["_client.name"], "[Brak klienta]");
        const status = safeGetFirstField<string>(optionTyped, ["status"], "");

        return (
            <div>
                <span>{optionTyped.name}</span>
                <div className="text-muted small text-wrap">
                    {clientName} | {status}
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
                repository={localRepository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

export type ContractSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    typesToInclude?: "our" | "other" | "all";
    _project?: ProjectData;
    readOnly?: boolean;
};

/**
 * Komponent formularza wyboru kontraktu z wyszukiwaniem asynchronicznym
 * Używa lokalnego repository aby nie kolidować z innymi komponentami
 */
export function ContractSelector({
    name = "_contract",
    showValidationInfo = true,
    multiple = false,
    typesToInclude = "all",
    _project,
    readOnly = false,
}: ContractSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<OurContract | OtherContract>({
                actionRoutes: {
                    getRoute: "contracts",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "contractSelector_temp",
            }),
        []
    );

    function renderOption(option: unknown) {
        const optionTyped = option as OurContract | OtherContract;
        // _ourIdOrNumber_Name powinno być zwrócone przez backend
        const mainLabel = safeGetFirstField<string>(optionTyped, ["ourId", "number"], "[Brak numeru]");
        const subLabel = safeGetFirstField<string>(optionTyped, ["alias", "name"], "[Brak nazwy]");

        return (
            <div>
                <span>{mainLabel}</span>
                <div className="text-muted small text-wrap">{subLabel}</div>
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
                repository={localRepository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                showValidationInfo={showValidationInfo}
                readOnly={readOnly}
            />
        </>
    );
}

interface ContractRangeSelectorProps {
    repository: any;
    showValidationInfo?: boolean;
    multiple?: boolean;
    name?: string;
}

export function ContractRangeSelector({
    repository,
    showValidationInfo = true,
    multiple = true,
    name = "_contractRanges",
}: ContractRangeSelectorProps) {
    const {
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext();
    const [options, setOptions] = useState<ContractRangeData[]>([]);

    const label = "Zakresy";

    useEffect(() => {
        const fetchData = async () => {
            await repository.loadItemsFromServerPOST();
            setOptions(repository.items);
            const currentValue = getValues(name);
            if (multiple) {
                if (!Array.isArray(currentValue) || currentValue.length === 0) {
                    setValue(name, []);
                }
            } else {
                if (!currentValue) {
                    setValue(name, null);
                }
            }
        };
        fetchData();
    }, [repository, setValue, multiple, name]);

    return (
        <Form.Group controlId={name}>
            <Form.Label>{label}</Form.Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const formValue = (field.value || []) as any[];
                    const currentSelection = options.filter((option) =>
                        formValue.some((item: any) => (item?._contractRange?.id || item?.id) === option.id)
                    );

                    return (
                        <Typeahead
                            id={`${name}-controlled`}
                            labelKey="name"
                            multiple={multiple}
                            options={options}
                            onChange={field.onChange}
                            selected={currentSelection}
                            placeholder="-- Wybierz zakresy kontraktu --"
                            isValid={showValidationInfo ? !errors?.[name] : undefined}
                            isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                            renderMenuItemChildren={(option, props, index) => {
                                const optionTyped = option as ContractRangeData;
                                return (
                                    <div>
                                        <span>{optionTyped.name}</span>
                                        <div className="text-muted small text-wrap">{optionTyped.description}</div>
                                    </div>
                                );
                            }}
                        />
                    );
                }}
            />
            <ErrorMessage errors={errors} name={name} />
        </Form.Group>
    );
}

type ContractTypeSelectorProps = {
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
export function ContractTypeSelector({
    typesToInclude = "all",
    required = false,
    showValidationInfo = true,
    multiple = false,
    name = "_type",
}: ContractTypeSelectorProps) {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const label = "Typ Kontraktu";
    const repository = MainSetup.contractTypesRepository;

    //tymczasowe, ale działa
    if (!repository) {
        return (
            <Form.Group controlId={label}>
                <Form.Label>{label}</Form.Label>
                <Form.Control placeholder="Odśwież aby załadować typy" disabled />
            </Form.Group>
        );
    }

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
                                        <div className="text-muted small text-wrap">{optionTyped.description}</div>
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

type CaseTypeSelectorProps = {
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
export function CaseTypeSelector({
    milestoneType,
    required = false,
    showValidationInfo = true,
    multiple = false,
    name = "_type",
}: CaseTypeSelectorProps) {
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
                                        <div className="text-muted small text-wrap">{myOption.description}</div>
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

type ContractMilestoneTypeSelectorProps = {
    contractType?: ContractType;
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
export function MilestoneTypeSelector({
    contractType,
    required = false,
    showValidationInfo = true,
    multiple = false,
    name = "_type",
}: ContractMilestoneTypeSelectorProps) {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const label = "Typ kamienia";
    const repository = milestoneTypesRepository;

    function makeOptions(repositoryDataItems: MilestoneType[]) {
        const filteredItems = repositoryDataItems.filter((item) => {
            if (!contractType) return true;
            if (contractType.id === item._contractType.id) return true;
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
                    rules={{ required: { value: required, message: "Wybierz typ kamienia" } }}
                    render={({ field }) => (
                        <Typeahead
                            id={`${label}-controlled`}
                            labelKey="name"
                            multiple={multiple}
                            options={makeOptions(repository.items)}
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
                                        <div className="text-muted small text-wrap">{myOption.description}</div>
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
export function OurLetterTemplateSelector({
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
                                        <div className="text-muted small text-wrap">{myOption.description}</div>
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

export type PersonSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    allowNew?: boolean;
    repository?: RepositoryReact<PersonData>;
};

export function PersonSelector({
    name = "_person",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    repository,
}: PersonSelectorProps) {
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            repository
                ? repository
                : new RepositoryReact<PersonData>({
                      actionRoutes: {
                          getRoute: "persons",
                          addNewRoute: "",
                          editRoute: "",
                          deleteRoute: "",
                      },
                      name: "personSelector_temp",
                  }),
        [repository]
    );

    function renderOption(option: any) {
        const typedOption = option as PersonData;
        // _nameSurnameEmail jest labelKey - zagwarantowane przez MyAsyncTypeahead
        const entityName = safeGetFirstField<string>(typedOption, ["_entity.name"], "[Brak encji]");

        return (
            <>
                <div>{typedOption._nameSurnameEmail}</div>
                <div className="text-muted small text-wrap"> {entityName}</div>
            </>
        );
    }

    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="_nameSurnameEmail"
                searchKey="searchText"
                repository={localRepository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                allowNew={allowNew}
                showValidationInfo={showValidationInfo}
            />
        </>
    );
}

type PersonsSelectorProps = {
    label: string;
    name: string;
    repository: RepositoryReact<PersonData>;
    multiple?: boolean;
    showValidationInfo?: boolean;
};
/**
 * Komponent formularza wyboru osoby
 * @param label oznaczenie pola formularza
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData
 */
export function PersonSelectorPreloaded({
    label,
    name,
    repository,
    multiple = false,
    showValidationInfo = true,
}: PersonsSelectorProps) {
    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext();

    function makeoptions(repositoryDataItems: (PersonData & { _nameSurname: string })[]) {
        repositoryDataItems.map((item) => (item._nameSurname = `${item.name} ${item.surname}`));
        return repositoryDataItems;
    }

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, string>) {
        const valueToBeSent = selectedOptions.length > 0 ? (multiple ? selectedOptions : selectedOptions[0]) : null;
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    function handleSelected(field: ControllerRenderProps<any, string>) {
        const currentValue = (field.value ? (multiple ? field.value : [field.value]) : []) as (PersonData & {
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
                        options={makeoptions(repository.items as (PersonData & { _nameSurname: string })[])}
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

function groupByMilestone(cases: Case[]) {
    return cases.reduce<Record<string, Case[]>>((groups, item) => {
        const key = item._parent?._FolderNumber_TypeName_Name ?? "Brak danych";
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
                const folderNumber = item._type?.folderNumber ?? "";
                const typeName = item._type?.name ?? "";
                const folderName = item._folderName ?? "";

                const menuItem = (
                    <MenuItem key={index} option={item} position={index}>
                        {folderNumber} {typeName} {folderName}
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
    _project?: ProjectData;
    _contract?: Contract;
    _offer?: OurOffer | ExternalOffer;
    _milestone?: MilestoneData;
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
                                <div className="text-muted small text-wrap">{myOption.description}</div>
                            </div>
                        );
                    }}
                />
            )}
        />
    );
}

type SystemRoleSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
};

export function SystemRoleSelector({ name = "systemRoleId", showValidationInfo = true }: SystemRoleSelectorProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const systemRolesOptions = Object.values(MainSetup.SystemRoles);

    return (
        <Form.Group controlId={name}>
            <Form.Label>Rola w systemie</Form.Label>
            <Form.Select
                isInvalid={!!errors?.[name]}
                isValid={showValidationInfo ? !errors?.[name] : undefined}
                {...register(name)}
            >
                <option value="">-- Wybierz rolę --</option>
                {systemRolesOptions.map((role) => (
                    <option key={role.id} value={role.id}>
                        {role.systemName}
                    </option>
                ))}
            </Form.Select>
            <ErrorMessage name={name} errors={errors} />
        </Form.Group>
    );
}

interface LetterSelectorProps {
    name: string;
    label: string;
    _contract?: Contract;
    showValidationInfo?: boolean;
}

/**
 * Komponent formularza do wyboru istniejącego pisma w ramach danego kontraktu.
 * Po wybraniu pisma, w formularzu ustawiana jest wartość jego numeru.
 * Uwaga: Używa własnej instancji repository, aby nie kolidować z głównym repo w FilterableTable.
 */
export function LetterSelector({ name, label, _contract, showValidationInfo = true }: LetterSelectorProps) {
    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext();
    const [options, setOptions] = useState<(OurLetterContract | IncomingLetterContract)[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<OurLetterContract | IncomingLetterContract>({
                actionRoutes: {
                    getRoute: "contractsLetters",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "letterSelector_temp",
            }),
        []
    );

    useEffect(() => {
        const fetchData = async () => {
            if (_contract?.id) {
                await localRepository.loadItemsFromServerPOST([{ contractId: _contract.id }]);
                setOptions(localRepository.items);
            } else {
                setOptions([]);
            }
        };
        fetchData();
    }, [_contract, localRepository]);

    function normalizeComparableValue(value: unknown) {
        if (value === null || value === undefined) return "";
        return String(value).trim();
    }

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<FieldValues, string>) {
        const selectedLetter = selectedOptions[0] as OurLetterContract | IncomingLetterContract | undefined;
        const valueToSet = selectedLetter?.number || "";

        setValue(name, valueToSet);
        field.onChange(valueToSet);
    }

    return (
        <Form.Group controlId={name}>
            <Form.Label>{label}</Form.Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const normalizedFieldValue = normalizeComparableValue(field.value);
                    const currentSelection = options.find(
                        (option) => normalizeComparableValue(option.number) === normalizedFieldValue
                    );

                    return (
                        <Typeahead
                            id={`${name}-typeahead`}
                            labelKey="number"
                            options={options}
                            onChange={(selected) => {
                                handleOnChange(selected, field);
                                setIsOpen(false);
                            }}
                            selected={currentSelection ? [currentSelection] : []}
                            placeholder="-- Wybierz pismo z listy --"
                            isValid={showValidationInfo ? !errors?.[name] : undefined}
                            isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                            open={isOpen}
                            onFocus={() => setIsOpen(true)}
                            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                            renderMenuItemChildren={(option: any) => (
                                <div>
                                    <span>{option.number}</span>
                                    <div className="text-muted small text-wrap">{option.description}</div>
                                </div>
                            )}
                        />
                    );
                }}
            />
            <ErrorMessage errors={errors} name={name} />
        </Form.Group>
    );
}

export type SkillSelectorProps = {
    name?: string;
    multiple?: boolean;
    showValidationInfo?: boolean;
    label?: string;
    repository?: RepositoryReact<SkillDictionaryRecord>;
};

export function SkillSelector({
    name = "_skills",
    multiple = true,
    showValidationInfo = false,
    label = "Specjalizacje",
    repository,
}: SkillSelectorProps) {
    const {
        setValue,
        control,
        formState: { errors },
    } = useFormContext();
    const [options, setOptions] = useState<SkillDictionaryRecord[]>([]);

    const localRepository = useMemo(
        () =>
            repository
                ? repository
                : new RepositoryReact<SkillDictionaryRecord>({
                      actionRoutes: {
                          getRoute: "v2/skills/search",
                          addNewRoute: "",
                          editRoute: "",
                          deleteRoute: "",
                      },
                      name: "skillSelector_temp",
                  }),
        [repository]
    );

    useEffect(() => {
        const fetchData = async () => {
            await localRepository.loadItemsFromServerPOST([]);
            setOptions(localRepository.items);
        };

        fetchData();
    }, [localRepository]);

    function handleOnChange(selected: SkillDictionaryRecord[], field: ControllerRenderProps<any, string>) {
        const valueToBeSent = multiple ? selected : selected[0];
        setValue(name, valueToBeSent);
        setValue("skillIds", selected.map((s) => s.id));
        field.onChange(valueToBeSent);
    }

    function getSelectedValue(fieldValue: unknown) {
        if (multiple) {
            return (fieldValue as SkillDictionaryRecord[]) || [];
        }

        if (fieldValue && typeof fieldValue === "object") {
            return [fieldValue as SkillDictionaryRecord];
        }

        return [];
    }

    return (
        <>
            <Form.Label>{label}</Form.Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Typeahead
                        id={`${name}-typeahead`}
                        labelKey="name"
                        multiple={multiple}
                        options={options}
                        onChange={(selected) => handleOnChange(selected as SkillDictionaryRecord[], field)}
                        selected={getSelectedValue(field.value)}
                        placeholder={multiple ? "-- Wybierz specjalizacje --" : "-- Wybierz specjalizacje --"}
                        isValid={showValidationInfo ? !errors?.[name] : undefined}
                        isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                        renderMenuItemChildren={(option) => {
                            const skill = option as SkillDictionaryRecord;
                            return (
                                <div>
                                    <span>{skill.name}</span>
                                    <div className="text-muted small text-wrap">{skill.description || "Brak opisu"}</div>
                                </div>
                            );
                        }}
                    />
                )}
            />
        </>
    );
}
