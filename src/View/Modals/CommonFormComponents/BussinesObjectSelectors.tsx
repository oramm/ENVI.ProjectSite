import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup, Form, InputGroup, ToggleButton } from "react-bootstrap";
import { Menu, MenuItem, Token, Typeahead } from "react-bootstrap-typeahead";
import { RenderTokenProps } from "react-bootstrap-typeahead/types/types";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLayerGroup, faPencil } from "@fortawesome/free-solid-svg-icons";
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
import { CaseStatusFilterMenuHeader, DEFAULT_CASE_STATUS_FILTER } from "./CaseStatusFilter";
import { StatusFilterMenuHeader } from "./StatusFilterMenuHeader";
import { ErrorMessage, MyAsyncTypeahead } from "./GenericComponents";
import { safeGetFirstField, ensureLabelKey } from "../../../React/Tools/ToolsForms";

type ProjectSelectorProps = {
    showValidationInfo?: boolean;
    name?: string;
    disabled?: boolean;
};

/**
 * Opakowanie selektora z opcjonalnym przyciskiem "+ Nowy…" (pick-or-create).
 * Gdy pojedynczy (single) selektor ma już wybraną wartość, przycisk znika,
 * a input dostaje pełną szerokość. Bez `onRequestCreate` renderuje sam selektor.
 */
function SelectorWithCreate({
    selector,
    caption,
    name,
    multiple,
    onRequestCreate,
    wrapperClassName,
}: {
    selector: JSX.Element;
    caption: string;
    name: string;
    multiple?: boolean;
    onRequestCreate?: () => void;
    wrapperClassName?: string;
}) {
    const { watch } = useFormContext();
    const hideCreate = !onRequestCreate || (!multiple && !!watch(name));
    if (hideCreate) {
        return wrapperClassName ? <div className={wrapperClassName}>{selector}</div> : <>{selector}</>;
    }
    return (
        <div className={`${wrapperClassName ? wrapperClassName + " " : ""}d-flex align-items-start gap-2`}>
            <div className="flex-grow-1">{selector}</div>
            <Button variant="outline-success" className="text-nowrap" onClick={onRequestCreate}>
                {caption}
            </Button>
        </div>
    );
}

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
        [],
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
    /**
     * Opcjonalny hook "pick-or-create": gdy przekazany, obok Typeahead renderowany jest
     * przycisk `+ Nowe miasto`. Gdy pominięty — zachowanie BEZ ZMIAN.
     */
    onRequestCreate?: () => void;
};

export function CitySelector({
    name = "_city",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    onRequestCreate,
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
        [],
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

    const selector = (
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
    );

    return (
        <SelectorWithCreate
            selector={selector}
            caption="+ Nowe miasto"
            name={name}
            multiple={multiple}
            onRequestCreate={onRequestCreate}
        />
    );
}

export type EntitySelectorProps = {
    name: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    allowNew?: boolean;
    repository?: RepositoryReact<EntityData>;
    /** Opcjonalny hook "pick-or-create": gdy przekazany, obok Typeahead renderowany jest przycisk `+ Nowy podmiot`. */
    onRequestCreate?: () => void;
};

export function EntitySelector({
    name,
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    repository,
    onRequestCreate,
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
        const shortName = safeGetFirstField<string>(typedOption, ["shortName"], "");
        const address = safeGetFirstField<string>(typedOption, ["address"], "[Brak adresu]");
        const taxNumber = safeGetFirstField<string>(typedOption, ["taxNumber"], "[Brak NIP]");

        return (
            <div>
                <span>{typedOption.name}</span>
                {shortName ? <div className="text-muted small text-wrap">{shortName}</div> : null}
                <div className="text-muted small text-wrap">
                    {address} | {taxNumber}
                </div>
            </div>
        );
    }

    const selector = (
        <MyAsyncTypeahead
            name={name}
            labelKey="name"
            searchKey="searchText"
            repository={localRepository}
            renderMenuItemChildren={renderOption}
            align="left"
            multiple={multiple}
            allowNew={allowNew}
            showValidationInfo={showValidationInfo}
        />
    );

    return (
        <SelectorWithCreate
            selector={selector}
            caption="+ Nowy podmiot"
            name={name}
            multiple={multiple}
            onRequestCreate={onRequestCreate}
            wrapperClassName="entity-selector-wrapper"
        />
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
        [],
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
    /** Opcjonalny hook "pick-or-create": gdy przekazany, obok Typeahead renderowany jest przycisk `+ Nowy program`. */
    onRequestCreate?: () => void;
};

export function FinancialAidProgrammeSelector({
    name = "_financialAidProgramme",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    repository,
    onRequestCreate,
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

    const selector = (
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
    );

    return (
        <SelectorWithCreate
            selector={selector}
            caption="+ Nowy program"
            name={name}
            multiple={multiple}
            onRequestCreate={onRequestCreate}
        />
    );
}

export type FocusAreaSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    allowNew?: boolean;
    _financialAidProgramme?: FinancialAidProgrammeData;
    /** Opcjonalny hook "pick-or-create": gdy przekazany, obok Typeahead renderowany jest przycisk `+ Nowe działanie`. */
    onRequestCreate?: () => void;
};

export function FocusAreaSelector({
    name = "_focusArea",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    _financialAidProgramme,
    onRequestCreate,
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
        [],
    );

    function renderOption(option: any) {
        const optionTyped = option as FocusAreaData;
        return (
            <div>
                <span>{optionTyped.name}</span>
            </div>
        );
    }

    const selector = (
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
    );

    return (
        <SelectorWithCreate
            selector={selector}
            caption="+ Nowe działanie"
            name={name}
            multiple={multiple}
            onRequestCreate={onRequestCreate}
        />
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
        [],
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
        [],
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

/** Domyślny filtr statusów kontraktów w selektorze: aktywne (bez 'Zakończony' i 'Archiwalny'). */
export const DEFAULT_CONTRACT_STATUS_FILTER = [
    MainSetup.ContractStatuses.NOT_STARTED,
    MainSetup.ContractStatuses.IN_PROGRESS,
];

export type ContractSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    typesToInclude?: "our" | "other" | "all";
    _project?: ProjectData;
    readOnly?: boolean;
    /** Statusy pokazywane po otwarciu listy; użytkownik może je przełączyć w nagłówku menu. */
    defaultStatuses?: string[];
    /** Maksymalna liczba podpowiedzi z serwera. Pominięty ⇒ bez limitu (zachowanie dotychczasowe). */
    limit?: number;
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
    defaultStatuses = DEFAULT_CONTRACT_STATUS_FILTER,
    limit,
}: ContractSelectorProps) {
    const {
        formState: { errors },
    } = useFormContext();

    // Filtrowanie statusów robi SERWER (lista jest doczytywana asynchronicznie i przycinana
    // limitem, więc filtr na kliencie ucinałby wyniki już po limicie). Pusty filtr = brak
    // warunku, czyli wszystkie statusy - spójnie z zachowaniem serwera.
    const [statusFilter, setStatusFilter] = useState<string[]>([...defaultStatuses]);

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
        [],
    );

    function renderOption(option: unknown) {
        const optionTyped = option as OurContract | OtherContract;
        const isOurContract = "ourId" in optionTyped;

        if (isOurContract) {
            const ourContract = optionTyped as OurContract;
            const secondaryParts = [ourContract.alias, ourContract._ourType, ourContract.status].filter(Boolean);

            return (
                <div>
                    <span>{ourContract.ourId || "[Brak numeru]"}</span>
                    <div className="text-muted small text-wrap">{secondaryParts.join(" | ") || "[Brak danych]"}</div>
                </div>
            );
        }

        const otherContract = optionTyped as OtherContract;
        const contractorsLabel = (otherContract._contractors ?? []).map((contractor) => contractor.name).filter(Boolean).join(", ");
        const primaryParts = [otherContract.alias, contractorsLabel].filter(Boolean);
        const secondaryParts = [`${otherContract._type?.name || "[Brak typu]"} ${otherContract.number || "[Brak numeru]"}`.trim(), otherContract.status].filter(Boolean);

        return (
            <div>
                <span>{primaryParts.join(" | ") || otherContract.name || "[Brak danych]"}</span>
                <div className="text-muted small text-wrap">{secondaryParts.join(" | ") || "[Brak danych]"}</div>
            </div>
        );
    }

    function renderContractMenu(results: unknown[], menuProps: any, state: any) {
        const contracts = results as (OurContract | OtherContract)[];

        return (
            // paddingTop: 0 usuwa górną szczelinę .dropdown-menu, w której przewijane
            // pozycje przebijałyby NAD sticky-nagłówkiem filtra statusów.
            <Menu {...menuProps} style={{ ...(menuProps.style || {}), paddingTop: 0 }}>
                <StatusFilterMenuHeader
                    allStatuses={Object.values(MainSetup.ContractStatuses)}
                    selectedStatuses={statusFilter}
                    onChange={setStatusFilter}
                />
                {contracts.length === 0 && (
                    <div className="px-3 py-2 text-muted small">
                        {state?.isLoading ? "Szukam…" : "Brak kontraktów."}
                    </div>
                )}
                {contracts.map((item, index) => (
                    <MenuItem key={item.id} option={item} position={index}>
                        {renderOption(item)}
                    </MenuItem>
                ))}
            </Menu>
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
                    statuses: statusFilter,
                    limit: limit,
                }}
                repository={localRepository}
                renderMenu={renderContractMenu}
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
                        formValue.some((item: any) => (item?._contractRange?.id || item?.id) === option.id),
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
    filterFn?: (item: CaseType) => boolean;
    showValidationInfo?: boolean;
    required?: boolean;
    multiple?: boolean;
    name?: "_type" | "_caseType";
    label?: string;
};

/**
 * Komponent formularza wyboru typu kontraktu
 * @param name nazwa pola w formularzu - zostanie wysłane na serwer jako składowa obiektu FormData (domyślnie '_type')
 * @param typesToInclude 'our' | 'other' | 'all' - jakie typy kontraktów mają być wyświetlane (domyślnie 'all')
 * @param showValidationInfo czy pokazywać informacje o walidacji (domyślnie true)
 * @param required czy pole jest wymagane (walidacja) - domyślnie false
 */
/**
 * Mała ikona obok typu sprawy informująca o krotności typu (zgodnie z regułą
 * `CaseType.isUniquePerMilestone`):
 * - `faLock` (kłódka) — typ UNIKALNY per kamień: max jedna sprawa tego typu, bez nazwy,
 * - `faLayerGroup` (warstwy) — typ WIELOKROTNY: wiele spraw tego typu odróżnianych nazwą.
 *
 * Dzięki temu użytkownik widzi w selektorze, czy dana sprawa jest "pojedyncza" czy jedną
 * z wielu — spójnie z polem "Nazwa sprawy", które pojawia się tylko dla typów wielokrotnych.
 */
/** Ogólna ikona unikalności — używana wszędzie tam, gdzie chcemy pokazać,
 *  czy dany typ jest unikalny (kłódka) czy wielokrotny (warstwy). */
export function UniquenessIcon({
    isUnique,
    title,
}: {
    isUnique: boolean;
    title?: string;
}) {
    const defaultTitle = isUnique
        ? "Typ unikalny"
        : "Typ wielokrotny";
    return (
        <FontAwesomeIcon
            icon={isUnique ? faLock : faLayerGroup}
            className={`ms-1 ${isUnique ? "text-secondary" : "text-primary"}`}
            size="sm"
            title={title ?? defaultTitle}
        />
    );
}

export function CaseMultiplicityIcon({ caseType }: { caseType?: CaseType }) {
    if (!caseType) return null;
    return (
        <UniquenessIcon
            isUnique={caseType.isUniquePerMilestone}
            title={
                caseType.isUniquePerMilestone
                    ? "Typ unikalny — jedna sprawa tego typu na kamieniu (bez nazwy)"
                    : "Typ wielokrotny — wiele spraw tego typu, odróżnianych nazwą"
            }
        />
    );
}

export function CaseTypeSelector({
    milestoneType,
    filterFn,
    required = false,
    showValidationInfo = true,
    multiple = false,
    name = "_type",
    label = "Typ Sprawy",
}: CaseTypeSelectorProps) {
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const repository = caseTypesRepository;

    function makeoptions(repositoryDataItems: CaseType[]) {
        let filteredItems = repositoryDataItems.filter((item) => {
            if (!milestoneType) return true;
            if (milestoneType.id === item._milestoneType.id) return true;
            return false;
        });
        if (filterFn) filteredItems = filteredItems.filter(filterFn);
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
                                        <span>
                                            {myOption.name}
                                            <CaseMultiplicityIcon caseType={myOption} />
                                        </span>
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

    const options = makeoptions(repository.items);
    const selectedTemplate = watch(name) as DocumentTemplate | undefined;
    // klucz zamiast referencji: makeoptions tworzy nową tablicę co render, options w deps zapętliłoby efekt
    const optionsKey = options.map((option) => option.id).join(",");

    useEffect(() => {
        const selectedIsAvailable = selectedTemplate && options.some((option) => option.id === selectedTemplate.id);
        if (selectedTemplate && !selectedIsAvailable) {
            // wybór nieaktualny po zmianie spraw — wyczyść; kolejny przebieg efektu ustawi jedyną opcję
            setValue(name, undefined, { shouldValidate: true });
            return;
        }
        // gdy dostępny jest dokładnie jeden szablon, ustaw go automatycznie
        if (!selectedTemplate && options.length === 1) {
            setValue(name, options[0], { shouldValidate: true });
        }
    }, [selectedTemplate, optionsKey, setValue]);

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
                            options={options}
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
    /** Opcjonalny hook "pick-or-create": gdy przekazany, obok Typeahead renderowany jest przycisk `+ Nowa osoba`. */
    onRequestCreate?: () => void;
};

export function PersonSelector({
    name = "_person",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
    repository,
    onRequestCreate,
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
        [repository],
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

    const selector = (
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
    );

    return (
        <SelectorWithCreate
            selector={selector}
            caption="+ Nowa osoba"
            name={name}
            multiple={multiple}
            onRequestCreate={onRequestCreate}
        />
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

export function RegisteringEditorSelector({
    label = "Osoba rejestrująca",
    name = "_editor",
    showValidationInfo = true,
    fetchRoute = "persons/registering-editors",
}: {
    label?: string;
    name?: string;
    showValidationInfo?: boolean;
    /** Endpoint zwracający listę osób (pierwsza = domyślnie wybrana). Domyślnie osoby rejestrujące. */
    fetchRoute?: string;
}) {
    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext();
    const [editors, setEditors] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRegisteringEditors = async () => {
            try {
                const response = await fetch(`${MainSetup.serverUrl}${fetchRoute}`, {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setEditors(data);

                    // Ustaw domyślnie pierwszą osobę (zalogowany użytkownik)
                    if (data.length > 0) {
                        setValue(name, data[0], { shouldValidate: true });
                    }
                }
            } catch (error) {
                console.error("Błąd pobierania osób rejestrujących:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegisteringEditors();
    }, [name, setValue, fetchRoute]);

    function makeOptions(items: PersonData[]) {
        return items.map((item) => ({
            ...item,
            _nameSurname: `${item.name} ${item.surname}`,
        }));
    }

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, string>) {
        const valueToBeSent = selectedOptions.length > 0 ? selectedOptions[0] : null;
        setValue(name, valueToBeSent, { shouldValidate: true });
        field.onChange(valueToBeSent);
    }

    function handleSelected(field: ControllerRenderProps<any, string>) {
        if (!field.value) return [];
        const selected = field.value as PersonData;
        // Typeahead wymaga labelKey (_nameSurname) na każdym elemencie, także w selected
        return [{
            ...selected,
            _nameSurname: `${selected.name} ${selected.surname}`,
        }];
    }

    if (isLoading) {
        return (
            <>
                <Form.Label>{label}</Form.Label>
                <Form.Control placeholder="Ładowanie..." disabled />
            </>
        );
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
                        options={makeOptions(editors)}
                        onChange={(items) => handleOnChange(items, field)}
                        selected={handleSelected(field)}
                        placeholder="-- Wybierz osobę --"
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
    milestoneNames: string[],
    header?: React.ReactNode,
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

    // paddingTop: 0 usuwa domyślną górną szczelinę .dropdown-menu, w której przewijane
    // sprawy przebijałyby NAD sticky-nagłówkiem filtra statusów.
    return (
        <Menu {...menuProps} style={{ ...(menuProps.style || {}), paddingTop: 0 }}>
            {header}
            {milestoneNames.length === 0 && (
                <div className="px-3 py-2 text-muted small">Brak spraw.</div>
            )}
            {items}
        </Menu>
    );
}

/** Token wybranej sprawy z ikoną ołówka pojawiającą się po kliknięciu (focus). */
function CaseEditableToken({
    option,
    tokenProps,
    onEdit,
}: {
    option: any;
    tokenProps: RenderTokenProps;
    onEdit: (item: Case) => void;
}) {
    const [focused, setFocused] = useState(false);
    const caseItem = option as Case;

    return (
        <Token
            onRemove={tokenProps.onRemove}
            option={option}
            tabIndex={tokenProps.tabIndex}
            disabled={tokenProps.disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        >
            {focused && (
                <FontAwesomeIcon
                    icon={faPencil}
                    size="xs"
                    className="me-1"
                    style={{ cursor: "pointer" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); onEdit(caseItem); }}
                    title="Edytuj sprawę"
                />
            )}
            {caseItem._typeFolderNumber_TypeName_Number_Name}
        </Token>
    );
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
    /**
     * Opcjonalny hook "pick-or-create": gdy przekazany, obok Typeahead renderowany jest
     * przycisk `+ Nowa sprawa` (host otwiera InlineCreateDrawer). Gdy pominięty —
     * zachowanie BEZ ZMIAN (brak przycisku), więc istniejące call-site są nietknięte.
     */
    onRequestCreate?: () => void;
    /**
     * Opcjonalny token odświeżenia opcji. Gdy host zmieni jego wartość (np. po utworzeniu
     * nowej sprawy przez InlineCreateDrawer), selektor przebuduje listę opcji ze ŹRÓDŁA
     * PRAWDY (`repository.items`, które addNewItem już zaktualizował). Pominięty ⇒ bez zmian.
     */
    refreshToken?: number;
    /**
     * Opcjonalny hook edycji: gdy przekazany, każdy token wybranej sprawy zyskuje ikonę
     * ołówka otwierającą InlineCreateDrawer w trybie edycji. Pominięty ⇒ bez zmian.
     */
    onRequestEdit?: (caseItem: Case) => void;
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
    onRequestEdit,
    showValidationInfo = true,
    multiple = true,
    onRequestCreate,
    refreshToken,
}: CaseSelectMenuElementProps) {
    const [options, setOptions] = useState<any[]>([]);
    // Domyślnie ukrywamy sprawy zamknięte; sprawy bez statusu (sprzed migracji) zawsze widoczne.
    const [statusFilter, setStatusFilter] = useState<string[]>([...DEFAULT_CASE_STATUS_FILTER]);

    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext();

    const labelKey = "_typeFolderNumber_TypeName_Number_Name";

    const visibleOptions = options.filter(
        (option) => !(option as Case).status || statusFilter.includes((option as Case).status!),
    );

    useEffect(() => {
        const fetchData = async () => {
            if (_contract) {
                await repository.loadItemsFromServerPOST([
                    { contractId: _contract.id, milestoneParentType: "CONTRACT" },
                ]);
                setOptions(
                    repository.items.map((item) => ensureLabelKey(item, labelKey, `CaseSelectMenuElement[${name}]`)),
                );
            } else if (_offer) {
                await repository.loadItemsFromServerPOST([{ offerId: _offer.id, milestoneParentType: "OFFER" }]);
                setOptions(
                    repository.items.map((item) => ensureLabelKey(item, labelKey, `CaseSelectMenuElement[${name}]`)),
                );
            } else {
                repository.clearData();
                setOptions([]);
            }
        };
        fetchData();
    }, [_contract?.id, _offer?.id, labelKey, name, repository, refreshToken]);

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, string>) {
        // Przy pustym wyborze wysyłamy null/[] (NIE undefined) — react-hook-form traktuje
        // setValue(undefined) jako brak zmiany i nie czyści pola kontrolowanego, przez co
        // Typeahead odbija kasowanie. Spójne z MyAsyncTypeahead.
        const valueToBeSent =
            selectedOptions.length > 0 ? (multiple ? selectedOptions : selectedOptions[0]) : multiple ? [] : null;
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    function getValidatedSelected(value: unknown) {
        if (!value) {
            return [];
        }

        const selectedValues = multiple ? (value as Case[]) : [value as Case];
        return selectedValues.map((item) => ensureLabelKey(item, labelKey, `CaseSelectMenuElement[${name}]`));
    }

    const selector = (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Typeahead
                    id={`${name}-typeahead`}
                    labelKey={labelKey}
                    multiple={multiple}
                    options={visibleOptions}
                    onChange={(items) => handleOnChange(items, field)}
                    renderMenu={(results, menuProps, state) => {
                        const groupedResults = groupByMilestone(results as Case[]);
                        const milestoneNames = Object.keys(groupedResults).sort();
                        const header = (
                            <CaseStatusFilterMenuHeader
                                selectedStatuses={statusFilter}
                                onChange={setStatusFilter}
                            />
                        );
                        return renderCaseMenu(
                            results as Case[],
                            menuProps,
                            state,
                            groupedResults,
                            milestoneNames,
                            header,
                        );
                    }}
                    selected={getValidatedSelected(field.value)}
                    placeholder="-- Wybierz sprawę --"
                    isValid={showValidationInfo ? !errors?.[name] : undefined}
                    isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                    renderMenuItemChildren={(option, props, index) => {
                        const myOption = option as Case;
                        return (
                            <div>
                                <span>
                                    {myOption._typeFolderNumber_TypeName_Number_Name}
                                    <CaseMultiplicityIcon caseType={myOption._type} />
                                </span>
                                <div className="text-muted small text-wrap">{myOption.description}</div>
                            </div>
                        );
                    }}
                    renderToken={onRequestEdit ? (option, tokenProps, idx) => (
                        <CaseEditableToken
                            key={idx}
                            option={option}
                            tokenProps={tokenProps}
                            onEdit={onRequestEdit}
                        />
                    ) : undefined}
                />
            )}
        />
    );

    // Bez `onRequestCreate` zachowanie jest IDENTYCZNE jak dotychczas (sam Typeahead z filtrem
    // statusów w menu), więc wszystkie istniejące call-site pozostają nietknięte.
    if (!onRequestCreate) return selector;

    return (
        <div className="d-flex align-items-start gap-2">
            <div className="flex-grow-1">{selector}</div>
            <Button
                variant="outline-success"
                className="text-nowrap"
                disabled={readonly}
                onClick={onRequestCreate}
            >
                + Nowa sprawa
            </Button>
        </div>
    );
}

interface MilestoneSelectorProps {
    name?: string;
    _contract?: Contract;
    /** Alternatywa dla `_contract` — kamienie milowe oferty (pisma do ofert). */
    _offer?: OurOffer | ExternalOffer;
    readOnly?: boolean;
    showValidationInfo?: boolean;
    // TODO(graf): onRequestCreate?: () => void — przyszły hook do inline tworzenia Kamienia
    // milowego z poziomu selektora (analogicznie do `+ Nowa sprawa` w CaseSelectMenuElement).
    // PR1 zostaje na poziomie Sprawy; rekurencyjne tworzenie Kamienia jest odroczone.
    onRequestCreate?: () => void;
    /**
     * Opcjonalny callback po załadowaniu opcji — przekazuje liczbę kamieni milowych
     * dla wybranego kontraktu. Host (np. CaseInlineCreateBody) używa go do obsługi stanu
     * "brak kamieni milowych" (link do TasksGlobal). Pominięty ⇒ bez zmian.
     */
    onOptionsLoaded?: (count: number) => void;
}

/**
 * Pole wyboru Kamienia milowego (Milestone) dla danego kontraktu.
 * Kamień milowy jest rodzicem Sprawy (`Case._parent`), więc selektor jest potrzebny
 * przy inline tworzeniu Sprawy w piśmie.
 *
 * Wzorowane na CaseSelectMenuElement, ale:
 * - single-select (Sprawa ma dokładnie jednego rodzica),
 * - używa WŁASNEJ lokalnej instancji repository z sufiksem `_temp` (useMemo) — nie
 *   przekazujemy repository przez propsy, aby nie zanieczyszczać globalnych repo.
 *
 * @param name nazwa pola formularza (domyślnie "_parent" — zgodnie z `Case._parent`)
 * @param _contract kontrakt, dla którego ładowane są kamienie milowe
 * @param readOnly czy pole jest tylko do odczytu (domyślnie false)
 * @param showValidationInfo czy wyświetlać informacje o walidacji (domyślnie true)
 */
export function MilestoneSelector({
    name = "_parent",
    _contract,
    _offer,
    readOnly = false,
    showValidationInfo = true,
    onRequestCreate,
    onOptionsLoaded,
}: MilestoneSelectorProps) {
    const [options, setOptions] = useState<MilestoneData[]>([]);

    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext();

    const labelKey = "_FolderNumber_TypeName_Name";

    // ✅ Lokalna instancja repository tylko dla tego selektora (sufiks `_temp`)
    const localRepository = useMemo(
        () =>
            new RepositoryReact<MilestoneData>({
                actionRoutes: {
                    getRoute: "milestones",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "milestoneSelector_temp",
            }),
        [],
    );

    useEffect(() => {
        const fetchData = async () => {
            if (_contract?.id) {
                // Backend `/milestones` czyta `orConditions` (warunki AND/OR) oraz typ rodzica:
                // top-level `parentType` albo `milestoneParentType` z pierwszego warunku
                // (domyślnie "CONTRACT"). Kształt zapytania spójny z CaseSelectMenuElement.
                await localRepository.loadItemsFromServerPOST([
                    { contractId: _contract.id, milestoneParentType: "CONTRACT" },
                ]);
                setOptions(
                    localRepository.items.map((item) =>
                        ensureLabelKey(item, labelKey, `MilestoneSelector[${name}]`),
                    ),
                );
                onOptionsLoaded?.(localRepository.items.length);
            } else if (_offer?.id) {
                // Kamienie oferty: typ rodzica podajemy w warunku (patrz komentarz wyżej).
                await localRepository.loadItemsFromServerPOST([
                    { offerId: _offer.id, milestoneParentType: "OFFER" },
                ]);
                setOptions(
                    localRepository.items.map((item) =>
                        ensureLabelKey(item, labelKey, `MilestoneSelector[${name}]`),
                    ),
                );
                onOptionsLoaded?.(localRepository.items.length);
            } else {
                localRepository.clearData();
                setOptions([]);
                onOptionsLoaded?.(0);
            }
        };
        fetchData();
    }, [_contract, _offer, labelKey, name, localRepository]);

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, string>) {
        const valueToBeSent = selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    function getValidatedSelected(value: unknown) {
        if (!value) {
            return [];
        }
        return [ensureLabelKey(value as MilestoneData, labelKey, `MilestoneSelector[${name}]`)];
    }

    return (
        <Form.Group controlId={name}>
            <Form.Label>Kamień milowy</Form.Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Typeahead
                        id={`${name}-typeahead`}
                        labelKey={labelKey}
                        multiple={false}
                        disabled={readOnly}
                        options={options}
                        onChange={(items) => handleOnChange(items, field)}
                        selected={getValidatedSelected(field.value)}
                        placeholder="-- Wybierz kamień milowy --"
                        isValid={showValidationInfo ? !errors?.[name] : undefined}
                        isInvalid={showValidationInfo ? !!errors?.[name] : undefined}
                        renderMenuItemChildren={(option) => {
                            const myOption = option as MilestoneData;
                            return (
                                <div>
                                    <span>{myOption._FolderNumber_TypeName_Name}</span>
                                    {myOption.description ? (
                                        <div className="text-muted small text-wrap">
                                            {myOption.description}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        }}
                    />
                )}
            />
            <ErrorMessage name={name} errors={errors} />
        </Form.Group>
    );
}

type SystemRoleSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
};

export function SystemRoleSelector({ name = "systemRoleId", showValidationInfo = true }: SystemRoleSelectorProps) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const systemRolesOptions = Object.values(MainSetup.SystemRoles);

    return (
        <Form.Group controlId={name}>
            <Form.Label>Rola w systemie</Form.Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const selected = systemRolesOptions.filter((r) => r.id === Number(field.value));
                    return (
                        <Typeahead
                            id={`${name}-typeahead`}
                            labelKey="systemName"
                            options={systemRolesOptions}
                            selected={selected}
                            onChange={(items) => {
                                const item = items[0] as (typeof systemRolesOptions)[0] | undefined;
                                field.onChange(item ? item.id : "");
                            }}
                            placeholder="-- Wybierz rolę --"
                            isValid={showValidationInfo ? !errors?.[name] : undefined}
                            isInvalid={!!errors?.[name]}
                            renderMenuItemChildren={(option) => {
                                const role = option as (typeof systemRolesOptions)[0];
                                return (
                                    <div>
                                        <span>{role.systemName}</span>
                                        <div className="text-muted small text-wrap">{role.description}</div>
                                    </div>
                                );
                            }}
                        />
                    );
                }}
            />
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
        [],
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
                        (option) => normalizeComparableValue(option.number) === normalizedFieldValue,
                    );

                    return (
                        <Typeahead
                            id={`${name}-typeahead`}
                            labelKey={(option: any) => (option.number != null ? String(option.number) : "")}
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
        [repository],
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
        setValue(
            "skillIds",
            selected.map((s) => s.id),
        );
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
                                    <div className="text-muted small text-wrap">
                                        {skill.description || "Brak opisu"}
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            />
        </>
    );
}
