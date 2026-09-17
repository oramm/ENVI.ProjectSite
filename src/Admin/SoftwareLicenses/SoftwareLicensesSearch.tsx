import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { SoftwareLicenseData } from "./SoftwareLicenseTypes";
import { softwareLicensesRepository } from "./SoftwareLicensesController";
import { SoftwareLicensesFilterBody } from "./SoftwareLicenseFilterBody";
import { SoftwareLicenseAddNewModalButton, SoftwareLicenseEditModalButton } from "./Modals/SoftwareLicenseModalButtons";
import { SoftwareLicenseKey } from "./SoftwareLicenseKey";
import { GDFolderIconLink } from "../../View/Resultsets/CommonComponents";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";

const date = (value: string | null) => value ? value.split("-").reverse().join(".") : "Nie podano";
export function SoftwareLicenseGoogleDriveAction({ dataObject, layout }: RowActionMenuItemProps<SoftwareLicenseData>) {
    return dataObject.googleDriveUrl ? <GDFolderIconLink folderUrl={dataObject.googleDriveUrl} layout={layout} /> : null;
}
export default function SoftwareLicensesSearch({ title }: { title: string }) {
    useEffect(() => { document.title = title; }, [title]);
    return <FilterableTable<SoftwareLicenseData> id="softwareLicenses" title={title}
        FilterBodyComponent={SoftwareLicensesFilterBody} repository={softwareLicensesRepository} searchOnMount
        AddNewButtonComponents={[SoftwareLicenseAddNewModalButton]} EditButtonComponent={SoftwareLicenseEditModalButton} isDeletable
        RowActionMenuComponents={[SoftwareLicenseGoogleDriveAction]}
        tableStructure={[
            { header: "Produkt", colMd: 3, renderTdBody: item => <div style={{ overflowWrap: "anywhere" }}><strong>{item.product}</strong><div>{item.manufacturer} {item.version}</div><small>{item.licenseType === "Subscription" ? "Subskrypcja" : item.licenseType}</small></div> },
            { header: "Stanowiska", colMd: 2, renderTdBody: item => <div>Kupione: {item.seatsPurchased}<br />Zajęte: {item.seatsUsed}<br /><strong>Wolne: {item.seatsFree}</strong></div> },
            { header: "Wygaśnięcie / status", colMd: 2, renderTdBody: item => <div style={{ overflowWrap: "anywhere" }}>{date(item.expirationDate)}<div>{item.status}</div></div> },
            { header: "Przypisanie", colMd: 2, renderTdBody: item => <div style={{ overflowWrap: "anywhere" }}>{item.assignment || "Nie podano"}</div> },
            { header: "Klucz", colMd: 2, renderTdBody: item => <SoftwareLicenseKey key={item.updatedAt} license={item} /> },
        ]} />;
}
