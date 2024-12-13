import React from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { MailData, MailDataToProcess } from "../../../../Typings/bussinesTypes";
import { mailInvitationsRepository, mailsToCheckRepository } from "../OffersController";
import { MailsFilterBody } from "./MailsFilterBody";
import { SetAsGoodToOfferButton, ShowMailsToCheckButton } from "./Modals/MailsModalButtons";
import { OfferInvitationMailStatusBadge, OfferStatusBadge } from "../../../View/Resultsets/CommonComponents";
import { PartialEditTrigger } from "../../../View/Modals/GeneralModalButtons";
import { Alert } from "react-bootstrap";
import { useFilterableTableContext } from "../../../View/Resultsets/FilterableTable/FilterableTableContext";
import { MailModalBodyStatus } from "./Modals/MailModalBodiesPartial";
import { makeMailStatusValidationSchema } from "./Modals/MailValidationSchema";

export default function MailInvitationsList() {
    function renderRowContent(dataItem: MailDataToProcess, isActive: boolean = false) {
        return (
            <>
                <div>
                    Od: <strong>{dataItem.from}</strong>, Do <strong>{dataItem.to}</strong> Otrzymano: {dataItem.date}{" "}
                    {renderStatus(dataItem)}
                </div>
                <div className="mb-1">Temat: {dataItem.subject}</div>
                Pierwsze 500 znaków maila:
                <div
                    style={{
                        maxWidth: "800px", // Ograniczenie szerokości
                        wordWrap: "break-word", // Łamanie długich słów
                        whiteSpace: "pre-wrap", // Obsługa nowych linii w tekście
                    }}
                    dangerouslySetInnerHTML={{ __html: dataItem.body?.substring(0, 300) + "..." }}
                ></div>
                {isActive && renderMenu()}
            </>
        );
    }

    function renderStatus(dataItem: MailDataToProcess) {
        if (!dataItem.status) return <Alert variant="danger">Brak statusu</Alert>;
        const { handleEditObject } = useFilterableTableContext<MailDataToProcess>();

        return (
            <PartialEditTrigger
                modalProps={{
                    initialData: dataItem,
                    modalTitle: "Edycja statusu",
                    repository: mailInvitationsRepository,
                    ModalBodyComponent: MailModalBodyStatus,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ["status"],
                    makeValidationSchema: makeMailStatusValidationSchema,
                }}
            >
                <OfferStatusBadge status={dataItem.status} />
            </PartialEditTrigger>
        );
    }

    function renderMenu() {
        return <SetAsGoodToOfferButton onError={() => {}} />;
    }

    return (
        <>
            <FilterableTable<MailDataToProcess>
                id="mailInvitations"
                tableStructure={[{ header: undefined, renderTdBody: renderRowContent }]}
                AddNewButtonComponents={[]}
                isDeletable={true}
                repository={mailInvitationsRepository}
                FilterBodyComponent={MailsFilterBody}
            />
        </>
    );
}
