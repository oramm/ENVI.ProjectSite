import React from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { MailDataToProcess } from "../../../../Typings/bussinesTypes";
import { mailInvitationsRepository } from "../OffersController";
import { AddNewOfferButton, SetAsGoodToOfferButton } from "./Modals/MailsModalButtons";
import { OfferInvitationMailStatusBadge, OfferStatusBadge } from "../../../View/Resultsets/CommonComponents";
import { PartialEditTrigger } from "../../../View/Modals/GeneralModalButtons";
import { Alert } from "react-bootstrap";
import { useFilterableTableContext } from "../../../View/Resultsets/FilterableTable/FilterableTableContext";
import { MailModalBodyStatus } from "./Modals/MailModalBodiesPartial";
import { makeMailStatusValidationSchema } from "./Modals/MailValidationSchema";
import { MailInvitationsFilterBody } from "./MailInvitationsFilterBody";

export default function MailInvitationsList() {
    function renderRowContent(dataItem: MailDataToProcess, isActive: boolean = false) {
        return (
            <>
                <div>
                    Od: <strong>{dataItem.from}</strong>, Do <strong>{dataItem.to}</strong> Otrzymano: {dataItem.date}{" "}
                    {renderStatus(dataItem)}
                </div>
                <div className="mb-1">Temat: {dataItem.subject}</div>
                {isActive && (
                    <>
                        <div
                            style={{
                                marginLeft: "10px",
                                padding: "10px",
                                borderLeft: "solid 2pt rgb(241 146 146)",
                                backgroundColor: "#ebf5f0",
                                wordWrap: "break-word", // Łamanie długich słów
                                whiteSpace: "pre-wrap", // Obsługa nowych linii w tekście
                            }}
                        >
                            <p>Pierwsze 500 znaków maila:</p>
                            <div dangerouslySetInnerHTML={{ __html: dataItem.body?.substring(0, 300) + "..." }}></div>
                        </div>
                        <div className="mt-2 mb-2">{renderMenu()}</div>
                    </>
                )}
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
                <OfferInvitationMailStatusBadge status={dataItem.status} />
            </PartialEditTrigger>
        );
    }

    function renderMenu() {
        return <AddNewOfferButton onError={() => {}} />;
    }

    return (
        <>
            <FilterableTable<MailDataToProcess>
                id="mailInvitations"
                tableStructure={[{ header: undefined, renderTdBody: renderRowContent }]}
                AddNewButtonComponents={[]}
                isDeletable={true}
                repository={mailInvitationsRepository}
                FilterBodyComponent={MailInvitationsFilterBody}
            />
        </>
    );
}
