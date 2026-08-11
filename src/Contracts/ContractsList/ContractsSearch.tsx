import React, { useEffect } from "react";
import { OtherContract, OurContract } from "../../../Typings/bussinesTypes";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { ContractRowContent } from "./ContractRowContent";
import { contractsRepository } from "./ContractsController";
import { ContractsFilterBody } from "./ContractsFilterBody";
import {
    ContractEditModalButton,
    OtherContractAddNewModalButton,
    OurContractAddNewModalButton,
} from "./Modals/ContractModalButtons";

export default function ContractsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<OurContract | OtherContract>
            id="contracts"
            title={title}
            FilterBodyComponent={ContractsFilterBody}
            tableStructure={[
                // Wszystkie kolumny poza jedną zeszły do bloku kontraktu (decyzja właściciela
                // 2026-08-11, makieta `tmp/makieta-lista-kontraktow-v3.html`, wariant A):
                // „Projekt”, „Oznaczenie”, „Rozpoczęcie”, „Zakończenie”, „Gwarancja”, a także
                // kolumna znaczników z wcześniejszej wersji makiety. Umowę ENVI od umowy
                // wykonawcy odróżnia sam kształt wiersza — tak jak w widoku zadań.
                // colLg 11, nie 12: dwunasta kolumna musi zostać wolna na RowActionMenu
                // aktywnego wiersza, inaczej menu zawija się na nowy wiersz i ląduje po lewej
                // (powód opisany szerzej w LettersSearch.tsx).
                {
                    header: "Kontrakt",
                    renderTdBody: (contract: OurContract | OtherContract) => (
                        <ContractRowContent contract={contract} />
                    ),
                    colLg: 11,
                },
            ]}
            AddNewButtonComponents={[OurContractAddNewModalButton, OtherContractAddNewModalButton]}
            EditButtonComponent={ContractEditModalButton}
            isDeletable={true}
            repository={contractsRepository}
            selectedObjectRoute={"/contract/"}
            shouldRetrieveDataBeforeEdit={true}
        />
    );
}
