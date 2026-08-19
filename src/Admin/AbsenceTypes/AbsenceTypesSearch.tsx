import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { AbsenceTypeData } from "../../../Typings/bussinesTypes";
import { AbsenceTypeAddNewModalButton, AbsenceTypeEditModalButton } from "./Modals/AbsenceTypeModalButtons";
import { absenceTypesRepository } from "./AbsenceTypesController";
import { AbsenceTypesFilterBody } from "./AbsenceTypeFilterBody";
import { ColorCell, TextCell } from "../adminTableCells";
import { poolLabel } from "./absenceTypePool";

/**
 * Lista typów nieobecności.
 *
 * Kolumna „Użyć” pokazuje, ile nieobecności korzysta z danego typu - typu
 * używanego w historii nie da się usunąć (blokuje to klucz obcy w bazie).
 */
export default function AbsenceTypesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<AbsenceTypeData>
            id="absenceTypes"
            title={title}
            FilterBodyComponent={AbsenceTypesFilterBody}
            tableStructure={[
                {
                    header: "Nazwa",
                    renderTdBody: (type: AbsenceTypeData) => <TextCell value={type.name} />,
                    colMd: 3,
                },
                {
                    header: "Kolor",
                    renderTdBody: (type: AbsenceTypeData) => <ColorCell value={type.color} />,
                    colMd: 3,
                },
                {
                    header: "Schodzi z puli",
                    renderTdBody: (type: AbsenceTypeData) => <TextCell value={poolLabel(type)} />,
                    colMd: 3,
                },
                {
                    header: "Użyć",
                    renderTdBody: (type: AbsenceTypeData) => <TextCell value={type._usageCount ?? 0} />,
                    colMd: 1,
                },
            ]}
            AddNewButtonComponents={[AbsenceTypeAddNewModalButton]}
            EditButtonComponent={AbsenceTypeEditModalButton}
            isDeletable={true}
            repository={absenceTypesRepository}
        />
    );
}
