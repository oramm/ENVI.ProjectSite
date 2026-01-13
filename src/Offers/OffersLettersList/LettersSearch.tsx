import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { lettersRepository } from "./LettersController";
import { LettersFilterBody } from "./LetterFilterBody";
import {
    LetterEditModalButton,
    IncomingLetterAddNewModalButton,
    OurLetterAddNewModalButton,
} from "./Modals/LetterModalButtons";
import { EntityData, IncomingLetterOffer, OurLetterOffer } from "../../../Typings/bussinesTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { PartialEditTrigger } from "../../View/Modals/GeneralModalButtons";
import { LetterStatusBadge } from "../../View/Resultsets/CommonComponents";
import { LetterModalBodyStatus } from "../../Letters/LettersList/Modals/LetterModalBodiesPartial";
import { useFilterableTableContext } from "../../View/Resultsets/FilterableTable/FilterableTableContext";

export default function OffersLettersSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function buildLabelFromEntities(entities: EntityData[]): string {
        if (!entities || entities.length === 0) return "";

        let label = "";
        for (let i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + "\n ";
        }
        label += entities[entities.length - 1].name;

        return label;
    }

    function makeEntitiesLabel(letter: OurLetterOffer | IncomingLetterOffer) {
        const mainEntitiesLabel = buildLabelFromEntities(letter._entitiesMain || []);
        const ccEntitiesLabel = buildLabelFromEntities(letter._entitiesCc || []);

        if (!mainEntitiesLabel) return <></>;

        let label = mainEntitiesLabel;
        if (ccEntitiesLabel?.length > 0) {
            label += "\n\nDW: " + ccEntitiesLabel;
        }

        return <div style={{ whiteSpace: "pre-line" }}>{label}</div>;
    }

    function renderIconTdBody(letter: OurLetterOffer | IncomingLetterOffer) {
        const icon = letter.isOur ? faPaperPlane : faEnvelope;
        return <FontAwesomeIcon icon={icon} size="lg" />;
    }

    function renderRowContent(letter: OurLetterOffer | IncomingLetterOffer){
        const cellStyle: React.CSSProperties = {
            wordBreak: "break-word",
            whiteSpace: 'pre-wrap',
        };
        return (
            <>
                {letter.number && (
                    <div style={cellStyle}>
                        Numer: <strong>{letter.number}</strong>
                    </div>
                )}
                <div className="mt-2" style={ cellStyle}>
                    Dotyczy: {letter.description}
                </div>
            </>
        );
    }

    return (
        <FilterableTable<OurLetterOffer | IncomingLetterOffer>
            id="offersLetters"
            title={title}
            FilterBodyComponent={LettersFilterBody}
            tableStructure={[
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIconTdBody, colMd: 1 },
                { header: "Utworzono", objectAttributeToShow: "creationDate", colMd: 1 },
                { header: "Wysłano", objectAttributeToShow: "registrationDate", colMd: 1 },
                { header: "Dane Pisma", renderTdBody: renderRowContent, colLg: 4 },
                { header: "Odbiorcy", renderTdBody: makeEntitiesLabel, colMd: 2 },
            ]}
            AddNewButtonComponents={[OurLetterAddNewModalButton, IncomingLetterAddNewModalButton]}
            EditButtonComponent={LetterEditModalButton}
            isDeletable={true}
            repository={lettersRepository}
            selectedObjectRoute={"/letter/"}
        />
    );
}
