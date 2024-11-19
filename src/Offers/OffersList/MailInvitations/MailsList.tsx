import React from "react";
import FilterableTable from "../../../View/Resultsets/FilterableTable/FilterableTable";
import { MailInvitation } from "../../../../Typings/bussinesTypes";
import { mailInvitationsRepository } from "../OffersController";

export default function MailsList() {
    function renderTdBody(dataItem: MailInvitation) {
        return (
            <>
                <div>
                    Od: <strong>{dataItem.from}</strong>, Otrzymano: {dataItem.date}
                </div>
                <div>Temat: {dataItem.subject}</div>
            </>
        );
    }

    return (
        <FilterableTable<MailInvitation>
            id="invitationMails"
            tableStructure={[{ header: undefined, renderTdBody }]}
            AddNewButtonComponents={[]}
            isDeletable={true}
            repository={mailInvitationsRepository}
        />
    );
}
