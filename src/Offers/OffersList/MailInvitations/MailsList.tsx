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
                <div>Temat: {dataItem.subject}</div>
                <div>{dataItem.body}</div>
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
