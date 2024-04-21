import React from "react";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "../../../Css/styles.css";

import MainSetup from "../../../React/MainSetupReact";
import { SelectTextOptionFormElement, SpecificTextOptionProps } from "./GenericComponents";

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
