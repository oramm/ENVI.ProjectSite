import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { NeedData } from "../../../Typings/bussinesTypes";
import { NeedsFilterBody } from "./NeedsFilterBody";
import { NeedAddNewModalButton, NeedEditModalButton } from "./Modals/NeedModalButtons";
import { needsRepository } from "../FinancialAidProgrammesController";

export default function NeedsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderClient(need: NeedData) {
        return <>{need._client.name}</>;
    }

    return (
        <FilterableTable<NeedData>
            id="needs"
            title={title}
            FilterBodyComponent={NeedsFilterBody}
            tableStructure={[
                { header: "Nazwa", objectAttributeToShow: "name" },
                { header: "Opis", objectAttributeToShow: "description" },
                { header: "Klient", renderTdBody: renderClient },
                { header: "Status", objectAttributeToShow: "status" },
            ]}
            AddNewButtonComponents={[NeedAddNewModalButton]}
            EditButtonComponent={NeedEditModalButton}
            isDeletable={true}
            repository={needsRepository}
            selectedObjectRoute={"/need/"}
        />
    );
}
