import { faEnvelope, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { EntityData, IncomingLetterContract, OurLetterContract } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import Tools from "../../React/Tools/Tools";
import ToolsDate from "../../React/Tools/ToolsDate";
import { PartialEditTrigger } from "../../View/Modals/GeneralModalButtons";
import { LetterStatusBadge } from "../../View/Resultsets/CommonComponents";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { useFilterableTableContext } from "../../View/Resultsets/FilterableTable/FilterableTableContext";
import { LettersFilterBody } from "./LetterFilterBody";
import { lettersRepository } from "./LettersController";
import { LetterModalBodyStatus } from "./Modals/LetterModalBodiesPartial";
import {
    ExportOurLetterContractToPDFButton,
    IncomingLetterAddNewModalButton,
    LetterEditModalButton,
    OurLetterAddNewModalButton,
    RespondToIncomingLetterButton,
} from "./Modals/LetterModalButtons";

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
        return (
            <div className="text-muted small mt-2">
                <span className="fw-bold">
                    {Tools.getLabelFromKey(letter._lastEvent.eventType, MainSetup.LetterEventType)}
                </span>{" "}
                {ToolsDate.dateToDDmmmYYYYHHMM(letter._lastEvent._lastUpdated!)} przez {letter._lastEvent._editor.name}{" "}
                {letter._lastEvent._editor.surname}
            </div>
        );
    }

    function renderStatus(letter: OurLetterContract | IncomingLetterContract) {
        const { handleEditObject } = useFilterableTableContext<OurLetterContract | IncomingLetterContract>();
        return (
            <PartialEditTrigger
                modalProps={{
                    initialData: letter,
                    modalTitle: `Edycja statusu pisma ${letter.number}`,
                    modalSubtitle: `Dotyczy: ${letter.description}`,
                    repository: lettersRepository,
                    ModalBodyComponent: LetterModalBodyStatus,
                    onEdit: (editedFields) => {
                        handleEditObject({ ...letter, ...editedFields });
                    },
                    fieldsToUpdate: ["status"],
                }}
            >
                <LetterStatusBadge status={letter.status || ""} />
            </PartialEditTrigger>
        );
    }

    function renderRowContent(letter: OurLetterContract | IncomingLetterContract, isActive: boolean = false) {
        return (
            <>
                {letter.number && (
                    <div>
                        Numer: <strong>{letter.number}</strong> {renderStatus(letter)}
                    </div>
                )}
                <div className="mt-2" style={{ whiteSpace: "pre-line" }}>
                    Dotyczy: {letter.description}
                    {letter.relatedLetterNumber && (
                        <>
                            <br />W odpowiedzi na pismo nr: {letter.relatedLetterNumber}
                        </>
                    )}
                    {letter.responseDueDate && (
                        <>
                            <br />
                            Wymagana odpowiedzi do dnia:{" "}
                            {ToolsDate.dateDMYtoYMD(ToolsDate.dateISOToDMY(letter.responseDueDate))}
                        </>
                    )}
                    {letter.responseIKNumber && (
                        <>
                            <br />
                            Odpowiedź IK: {letter.responseIKNumber}
                        </>
                    )}
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
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIconTdBody, colLg: 1 },
                { header: "Utworzono", objectAttributeToShow: "creationDate", colLg: 1 },
                { header: "Wysłano", objectAttributeToShow: "registrationDate", colLg: 1 },
                { header: "Dane Pisma", renderTdBody: renderRowContent, colLg: 4 },
                { header: "Odbiorcy", renderTdBody: makeEntitiesLabel, colLg: 3 },
            ]}
            AddNewButtonComponents={[OurLetterAddNewModalButton, IncomingLetterAddNewModalButton]}
            EditButtonComponent={LetterEditModalButton}
            RowActionMenuComponents={[RespondToIncomingLetterButton]}
            isDeletable={true}
            repository={lettersRepository}
            selectedObjectRoute={"/letter/"}
        />
    );
}
