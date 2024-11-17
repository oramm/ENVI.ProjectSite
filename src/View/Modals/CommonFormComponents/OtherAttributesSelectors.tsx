import React, { useEffect, useState } from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "../../../Css/styles.css";

import MainSetup from "../../../React/MainSetupReact";
import { ErrorMessage, TextOptionSelector, SpecificTextOptionProps } from "./GenericComponents";
import { Form } from "react-bootstrap";
import { Controller, ControllerRenderProps } from "react-hook-form";
import { Typeahead } from "react-bootstrap-typeahead";
import { useFormContext } from "../FormContext";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/ToolsDate";
import { hasError } from "../../Resultsets/CommonComponentsController";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export function OfferBidProcedureSelectFormElement({
    showValidationInfo = true,
    name = "bidProcedure",
    as,
}: SpecificTextOptionProps) {
    const options = Object.entries(MainSetup.OfferBidProcedure).map(([key, value]) => value);
    return (
        <TextOptionSelector
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
        <TextOptionSelector
            options={options}
            showValidationInfo={showValidationInfo}
            name={name}
            as={as}
            label="Forma wysyłki"
        />
    );
}

interface GdFilesSelectorProps {
    contextData: RepositoryDataItem;
    attentionRequiredFileNames?: string[];
    showValidationInfo?: boolean;
    multiple?: boolean;
    name?: string;
}

interface GdFileData {
    id: string;
    name: string;
    modifiedTime: string;
    lastModifyingUser: { displayName: string };
}

export function GdFilesSelector({
    contextData,
    attentionRequiredFileNames = [],
    showValidationInfo = true,
    multiple = true,
    name = "_gdFilesBasicData",
}: GdFilesSelectorProps) {
    const {
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext();
    const [options, setOptions] = useState<GdFileData[]>([]); // Inicjalizujemy z pustą tablicą

    const label = "Pliki z Dysku Google";

    // Jednorazowe pobieranie danych z serwera
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${MainSetup.serverUrl}getFilesDataFromGdFolder`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(contextData),
                });

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Dane z serwera nie są tablicą");
                }
                setOptions(data || []);
            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            }
        };

        fetchData();
    }, [contextData, setValue, multiple, name, getValues]);

    function handleOnChange(selectedOptions: unknown[], field: ControllerRenderProps<any, typeof name>) {
        const valueToBeSent = multiple ? selectedOptions : selectedOptions[0];
        setValue(name, valueToBeSent);
        field.onChange(valueToBeSent);
    }

    function renderOption(option: GdFileData) {
        const formattedDate = ToolsDate.formatTime(option.modifiedTime);
        const isAttentionRequired = attentionRequiredFileNames.some(
            (fileName) => option.name.toLowerCase() === fileName.toLowerCase()
        );
        return isAttentionRequired
            ? renderAttentionRequiredOption(option.name, formattedDate, option.lastModifyingUser.displayName)
            : renderNormalOption(option.name, formattedDate, option.lastModifyingUser.displayName);
    }

    function renderAttentionRequiredOption(name: string, formattedDate: string, displayName: string) {
        return (
            <div>
                <span className="text-warning">{name}</span>
                <div className="text-warning small">
                    Zmienione ostatnio {formattedDate} przez {displayName}
                </div>
                <FontAwesomeIcon icon={faExclamationTriangle} /> <span>Plik był ostatnio wysłany</span>
            </div>
        );
    }

    function renderNormalOption(name: string, formattedDate: string, displayName: string) {
        return (
            <div>
                <span>{name}</span>
                <div className="text-muted small">
                    Zmienione ostatnio {formattedDate} przez {displayName}
                </div>
            </div>
        );
    }

    return (
        <Form.Group controlId={name}>
            <Form.Label>{label}</Form.Label>
            <>
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <Typeahead
                            id={`${name}-controlled`}
                            labelKey="name" // Klucz do wyświetlania nazw plików
                            multiple={multiple}
                            options={options} // Opcje pochodzące z serwera
                            onChange={(items) => handleOnChange(items, field)}
                            selected={field.value ? (multiple ? field.value : [field.value]) : []} // Aktualnie wybrane opcje
                            placeholder="-- Wybierz plik --"
                            isValid={showValidationInfo ? !hasError(errors, name) : undefined}
                            isInvalid={showValidationInfo ? hasError(errors, name) : undefined}
                            renderMenuItemChildren={(option, props, index) => {
                                const optionTyped = option as GdFileData;
                                return renderOption(optionTyped);
                            }}
                        />
                    )}
                />
                <ErrorMessage errors={errors} name={name} />
            </>
        </Form.Group>
    );
}
