import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { lettersRepository } from "./LettersController";
import { LettersFilterBody } from "./LetterFilterBody";
import {
    LetterEditModalButton,
    IncomingLetterAddNewModalButton,
    OurLetterAddNewModalButton,
} from "./Modals/LetterModalButtons";
import { Entity, IncomingLetter, OurLetter } from "../../../Typings/bussinesTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function OffersLettersSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function buildLabelFromEntities(entities: Entity[]): string {
        if (!entities || entities.length === 0) return "";

        let label = "";
        for (let i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + "\n ";
        }
        label += entities[entities.length - 1].name;

        return label;
    }

    function makeEntitiesLabel(letter: OurLetter | IncomingLetter) {
        const mainEntitiesLabel = buildLabelFromEntities(letter._entitiesMain);
        const ccEntitiesLabel = buildLabelFromEntities(letter._entitiesCc);

        if (!mainEntitiesLabel) return <></>;

        let label = mainEntitiesLabel;
        if (ccEntitiesLabel?.length > 0) {
            label += "\n\nDW: " + ccEntitiesLabel;
        }

        return <div style={{ whiteSpace: "pre-line" }}>{label}</div>;
    }

    function renderIconTdBody(letter: OurLetter | IncomingLetter) {
        letter = letter as OurLetter | IncomingLetter;
        const icon = letter.isOur ? faPaperPlane : faEnvelope;

        return <FontAwesomeIcon icon={icon} size="lg" />;
    }

    return (
        <FilterableTable<OurLetter | IncomingLetter>
            id="letters"
            title={title}
            FilterBodyComponent={LettersFilterBody}
            tableStructure={[
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIconTdBody },
                { header: "Utworzono", objectAttributeToShow: "creationDate" },
                { header: "Wysłano", objectAttributeToShow: "registrationDate" },
                { header: "Numer", objectAttributeToShow: "number" },
                { header: "Dotyczy", objectAttributeToShow: "description" },
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
