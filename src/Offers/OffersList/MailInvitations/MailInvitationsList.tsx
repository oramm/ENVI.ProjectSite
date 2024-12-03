import React from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { MailData } from "../../../../Typings/bussinesTypes";
import { mailInvitationsRepository, mailsToCheckRepository } from "../OffersController";
import { MailsFilterBody } from "./MailsFilterBody";
import { SetAsGoodToOfferButton, ShowMailsToCheckButton } from "./MailsModalButtons";

export default function MailInvitationsList() {
    function renderRowContent(dataItem: MailData, isActive: boolean = false) {
        return (
            <>
                <div>
                    Od: <strong>{dataItem.from}</strong>, Do <strong>{dataItem.to}</strong> Otrzymano: {dataItem.date}
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

    function renderMenu() {
        return <SetAsGoodToOfferButton onError={() => {}} />;
    }

    return (
        <>
            <FilterableTable<MailData>
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
