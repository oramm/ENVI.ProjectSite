import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { EntityData, IncomingLetterContract, OurLetterContract } from "../../../Typings/bussinesTypes";
import { PartialEditTrigger } from "../../View/Modals/GeneralModalButtons";
import { LetterStatusBadge } from "../../View/Resultsets/CommonComponents";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { useFilterableTableContext } from "../../View/Resultsets/FilterableTable/FilterableTableContext";
import { LettersFilterBody } from "./LetterFilterBody";
import { lettersRepository } from "./LettersController";
import { LetterRowContent, LetterRowMarkers } from "./LetterRowContent";
import { LetterModalBodyStatus } from "./Modals/LetterModalBodiesPartial";
import {
    ExportOurLetterContractToPDFButton,
    IncomingLetterAddNewModalButton,
    LetterEditModalButton,
    OurLetterAddNewModalButton,
    RespondToLetterButton,
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
        return <LetterRowMarkers letter={letter} />;
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
            <LetterRowContent
                letter={letter}
                context="contract"
                renderStatus={(rowLetter) => renderStatus(rowLetter as OurLetterContract | IncomingLetterContract)}
                renderExtras={(rowLetter) =>
                    rowLetter.isOur ? (
                        <ExportToPDFButtonWithError ourLetterContract={rowLetter as OurLetterContract} isActive={isActive} />
                    ) : null
                }
            />
        );
    }

    return (
        <FilterableTable<OurLetterContract | IncomingLetterContract>
            id="contractsLetters"
            title={title}
            FilterBodyComponent={LettersFilterBody}
            tableStructure={[
                // Kolumny „Utworzono” i „Wysłano” zeszły do paska meta w bloku pisma
                // (decyzja właściciela 2026-07-31) — odzyskane miejsce idzie na treść.
                { renderThBody: () => <i className="fa fa-inbox fa-lg"></i>, renderTdBody: renderIconTdBody, colLg: 1 },
                { header: "Pismo", renderTdBody: renderRowContent, colLg: 8 },
                { header: "Odbiorcy", renderTdBody: makeEntitiesLabel, colLg: 3 },
            ]}
            AddNewButtonComponents={[OurLetterAddNewModalButton, IncomingLetterAddNewModalButton]}
            EditButtonComponent={LetterEditModalButton}
            RowActionMenuComponents={[RespondToLetterButton]}
            isDeletable={true}
            repository={lettersRepository}
            selectedObjectRoute={"/letter/"}
        />
    );
}
