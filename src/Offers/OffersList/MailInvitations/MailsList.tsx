import React from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { MailData } from "../../../../Typings/bussinesTypes";
import { mailInvitationsRepository } from "../OffersController";
import { MailsFilterBody } from "./MailsFilterBody";

export default function MailsList() {
    function renderTdBody(dataItem: MailData) {
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
                    dangerouslySetInnerHTML={{ __html: dataItem.body.substring(0, 300) + "..." }}
                ></div>
            </>
        );
    }

    return (
        <FilterableTable<MailData>
            id="invitationMails"
            tableStructure={[{ header: undefined, renderTdBody }]}
            AddNewButtonComponents={[]}
            isDeletable={true}
            repository={mailInvitationsRepository}
            FilterBodyComponent={MailsFilterBody}
        />
    );
}
