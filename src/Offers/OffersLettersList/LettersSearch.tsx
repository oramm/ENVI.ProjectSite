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
import { LetterRowContent, LetterRowMarkers } from "../../Letters/LettersList/LetterRowContent";
import { LetterStatusBadge } from "../../View/Resultsets/CommonComponents";

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
        return <LetterRowMarkers letter={letter} />;
    }

    function renderRowContent(letter: OurLetterOffer | IncomingLetterOffer) {
        return (
            <LetterRowContent
                letter={letter}
                context="offer"
                // Status tylko do odczytu — edycja statusu pisma ofertowego nie istniała
                // w tym rejestrze i nie jest przedmiotem tej zmiany.
                renderStatus={(rowLetter) => (rowLetter.status ? <LetterStatusBadge status={rowLetter.status} /> : null)}
            />
        );
    }

    return (
        <FilterableTable<OurLetterOffer | IncomingLetterOffer>
            id="offersLetters"
            title={title}
            FilterBodyComponent={LettersFilterBody}
            tableStructure={[
                // Ta sama siatka co w rejestrze pism kontraktowych — daty zeszły do paska meta.
                // Suma colLg maks. 11: dwunasta kolumna jest zarezerwowana na RowActionMenu.
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIconTdBody, colLg: 1 },
                { header: "Pismo", renderTdBody: renderRowContent, colLg: 7 },
                { header: "Odbiorcy", renderTdBody: makeEntitiesLabel, colLg: 3 },
            ]}
            AddNewButtonComponents={[OurLetterAddNewModalButton, IncomingLetterAddNewModalButton]}
            EditButtonComponent={LetterEditModalButton}
            isDeletable={true}
            repository={lettersRepository}
            selectedObjectRoute={"/letter/"}
        />
    );
}
