import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { InvoicesFilterBody } from "./InvoiceFilterBody";
import { InvoiceEditModalButton, InvoiceAddNewModalButton } from "./Modals/InvoiceModalButtons";
import { Invoice } from "../../../Typings/bussinesTypes";
import { invoicesRepository } from "./InvoicesController";
import { InvoiceRowContent } from "./InvoiceRowContent";

export default function InvoicesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<Invoice>
            id="invoices"
            title={title}
            FilterBodyComponent={InvoicesFilterBody}
            searchOnMount={true}
            tableStructure={[
                // Wszystkie kolumny zeszły do jednego bloku faktury (makieta
                // `tmp/makieta-lista-faktur-v1.html`, wariant A, decyzja właściciela 2026-08-31):
                // „Numer”, „Dane faktury”, „Sprzedaż”, „Data wystawienia”, „Netto”, „Termin
                // płatności” i „Status”. Daty stoją teraz w jednej kolumnie bocznej bloku, bo
                // w wąskich kolumnach się zawijały.
                // colLg 11, nie 12: dwunasta kolumna zostaje wolna na RowActionMenu aktywnego
                // wiersza — powód opisany w LettersSearch.tsx.
                {
                    header: "Faktura",
                    renderTdBody: (invoice: Invoice) => <InvoiceRowContent invoice={invoice} />,
                    colLg: 11,
                },
            ]}
            AddNewButtonComponents={[InvoiceAddNewModalButton]}
            EditButtonComponent={InvoiceEditModalButton}
            isDeletable={(invoice: Invoice) => !invoice.ksefNumber}
            isCopyable={true}
            repository={invoicesRepository}
            selectedObjectRoute={"/invoice/"}
        />
    );
}
