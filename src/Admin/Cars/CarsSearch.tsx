import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { CarData } from "../../../Typings/bussinesTypes";
import { CarAddNewModalButton, CarEditModalButton } from "./Modals/CarModalButtons";
import { carsRepository } from "./CarsController";
import { CarsFilterBody } from "./CarFilterBody";
import { BoolCell, OptionalTextCell, TextCell } from "../adminTableCells";

/**
 * Lista samochodów służbowych.
 *
 * Bez usuwania: kilometrówka trzyma historię w arkuszach Google powiązanych przez
 * identyfikator arkusza, a nie przez klucz obcy. Skasowanie auta rozspójniłoby
 * arkusz z systemem po cichu. Wycofanie z użytku to wyłączenie flagi „Aktywny”.
 *
 * Suma colMd wynosi 11, bo ostatnią kolumnę (1 z 12) zajmują przyciski akcji.
 * Przekroczenie tej sumy zrzuca je do kolejnego wiersza.
 */
export default function CarsSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<CarData>
            id="cars"
            title={title}
            FilterBodyComponent={CarsFilterBody}
            tableStructure={[
                {
                    header: "Marka",
                    renderTdBody: (car: CarData) => <TextCell value={car.brand} />,
                    colMd: 2,
                },
                {
                    header: "Model",
                    renderTdBody: (car: CarData) => <TextCell value={car.model} />,
                    colMd: 2,
                },
                {
                    header: "Nr rej.",
                    renderTdBody: (car: CarData) => <TextCell value={car.licensePlateNumber} />,
                    colMd: 1,
                },
                {
                    header: "Aktywny",
                    renderTdBody: (car: CarData) => <BoolCell value={car.isActive} />,
                    colMd: 1,
                },
                {
                    header: "W kilometrówce",
                    renderTdBody: (car: CarData) => (
                        <BoolCell value={!!car.isActive && !!car.mileageSpreadsheetId && car.mileageSheetGid != null} />
                    ),
                    colMd: 2,
                },
                {
                    header: "Uwagi",
                    renderTdBody: (car: CarData) => <OptionalTextCell value={car.comment} />,
                    colMd: 3,
                },
            ]}
            AddNewButtonComponents={[CarAddNewModalButton]}
            EditButtonComponent={CarEditModalButton}
            isDeletable={false}
            repository={carsRepository}
        />
    );
}
