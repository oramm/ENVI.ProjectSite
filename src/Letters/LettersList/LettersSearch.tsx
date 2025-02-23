import React, { useEffect, useState } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { lettersRepository } from "./LettersController";
import { LettersFilterBody } from "./LetterFilterBody";
import {
    LetterEditModalButton,
    IncomingLetterAddNewModalButton,
    OurLetterAddNewModalButton,
    ExportOurLetterContractToPDFButton,
} from "./Modals/LetterModalButtons";
import { EntityData, IncomingLetterContract, OurLetterContract } from "../../../Typings/bussinesTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import ToolsDate from "../../React/ToolsDate";
import { Alert } from "react-bootstrap";
import Tools from "../../React/Tools";
import MainSetup from "../../React/MainSetupReact";

export default function LettersSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function buildLabelFromEntities(entities: EntityData[] | undefined): string {
        if (!entities || entities.length === 0) return "";

        let label = "";
        for (let i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + "\n ";
        }
        label += entities[entities.length - 1].name;

        return label;
    }

    function makeEntitiesLabel(letter: OurLetterContract | IncomingLetterContract) {
        const mainEntitiesLabel = buildLabelFromEntities(letter._entitiesMain);
        const ccEntitiesLabel = buildLabelFromEntities(letter._entitiesCc);

        if (!mainEntitiesLabel) return <></>;

        let label = mainEntitiesLabel;
        if (ccEntitiesLabel?.length > 0) {
            label += "\n\nDW: " + ccEntitiesLabel;
        }

        return <div style={{ whiteSpace: "pre-line" }}>{label}</div>;
    }

    function renderIconTdBody(letter: OurLetterContract | IncomingLetterContract) {
        const icon = letter.isOur ? faPaperPlane : faEnvelope;
        return <FontAwesomeIcon icon={icon} size="lg" />;
    }

    function ExportToPDFButtonWithError({
        ourLetterContract,
        isActive,
    }: {
        ourLetterContract: OurLetterContract;
        isActive: boolean;
    }) {
        const [error, setError] = useState<Error | null>(null);

        useEffect(() => {
            if (error) {
                console.log("Error zaktualizowany:", error.message);
            }
        }, [error]);

        if (!ourLetterContract.isOur || !isActive) return null;

        return (
            <>
                <ExportOurLetterContractToPDFButton
                    onError={(error) => setError(error)}
                    ourLetterContract={ourLetterContract}
                />
                {error && (
                    <Alert dismissible variant="danger" className="mt-2" onClose={() => setError(null)}>
                        {error.message}
                    </Alert>
                )}
            </>
        );
    }

    function renderLastEvent(letter: OurLetterContract | IncomingLetterContract) {
        if (!letter._lastEvent) return null;
        if (letter.isOur)
            return (
                <div className="text-muted">
                    <span className="fw-bold">
                        {Tools.getLabelFromKey(letter._lastEvent.eventType, MainSetup.LetterEventType)}
                    </span>{" "}
                    {ToolsDate.formatTime(letter._lastEvent._lastUpdated!)} przez {letter._lastEvent._editor.name}{" "}
                    {letter._lastEvent._editor.surname}
                </div>
            );
        else
            return (
                <div className="text-muted">
                    <span className="fw-bold">{letter._lastEvent.eventType} </span>{" "}
                    {ToolsDate.formatTime(letter._lastEvent._lastUpdated!)} przez {letter._lastEvent._editor.name}{" "}
                    {letter._lastEvent._editor.surname}
                </div>
            );
    }

    function renderRowContent(letter: OurLetterContract | IncomingLetterContract, isActive: boolean = false) {
        return (
            <>
                <div className="text-muted" style={{ whiteSpace: "pre-line" }}>
                    Dotyczy: {letter.description}
                </div>
                {letter.isOur && <ExportToPDFButtonWithError ourLetterContract={letter} isActive={isActive} />}
                {renderLastEvent(letter)}
            </>
        );
    }

    return (
        <FilterableTable<OurLetterContract | IncomingLetterContract>
            id="contractsLetters"
            title={title}
            FilterBodyComponent={LettersFilterBody}
            tableStructure={[
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIconTdBody },
                { header: "Utworzono", objectAttributeToShow: "creationDate" },
                { header: "Wysłano", objectAttributeToShow: "registrationDate" },
                { header: "Numer", objectAttributeToShow: "number" },
                { header: "Dane Pisma", renderTdBody: renderRowContent },
                { header: "Odbiorcy", renderTdBody: makeEntitiesLabel },
            ]}
            AddNewButtonComponents={[OurLetterAddNewModalButton, IncomingLetterAddNewModalButton]}
            EditButtonComponent={LetterEditModalButton}
            isDeletable={true}
            repository={lettersRepository}
            selectedObjectRoute={"/letter/"}
        />
    );
}
