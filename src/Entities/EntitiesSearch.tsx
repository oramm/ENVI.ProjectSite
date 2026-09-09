import React, { useEffect } from "react";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { EntityData } from "../../Typings/bussinesTypes";
import { EntityAddNewModalButton, EntityEditModalButton } from "./Modals/EntityModalButtons";
import { entitiesRepository } from "./EntitiesController";
import { EntitiesFilterBody } from "./EntityFilterBody";
import { GusStatusBadge } from "./EntitiesBadges";

export default function EntitiesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<EntityData>
            id="entities"
            title={title}
            FilterBodyComponent={EntitiesFilterBody}
            tableStructure={[
                {
                    header: "Nazwa",
                    renderTdBody: (entity: EntityData) => (
                        <div>
                            <div>{entity.name}</div>
                            {entity.shortName && (
                                <div className="text-muted small text-wrap" style={{ opacity: 0.8 }}>
                                    {entity.shortName}
                                </div>
                            )}
                        </div>
                    ),
                    colMd: 3,
                },
                { header: "Adres", objectAttributeToShow: "address", colMd: 2 },
                { header: "NIP", objectAttributeToShow: "taxNumber", colMd: 2 },
                /* Telefon zostaje przy 2: numer w zapisie „+48600881774" nie ma gdzie się złamać
                   i przy jednej kolumnie wychodził poza komórkę (zmierzone: 5 rekordów z 191
                   z numerem, przepełnienie 13 px). Adres wolno zwęzić, bo zawija się na spacjach. */
                { header: "Telefon", objectAttributeToShow: "phone", colMd: 2 },
                /* GUS-4b: plakietka wyniku porównania z rejestrem. Suma colMd MUSI zostać
                   na 11 - dwunastą kolumnę FilterableTableRow rezerwuje dla menu akcji
                   (kanon 40_wiki/firma/technologie/przeglad-wizualny-ui-lokalnie, case PIS). */
                {
                    header: "GUS",
                    renderTdBody: (entity: EntityData) => (
                        <GusStatusBadge status={entity.gusStatus} checkedAt={entity.gusCheckedAt} />
                    ),
                    colMd: 2,
                },
            ]}
            AddNewButtonComponents={[EntityAddNewModalButton]}
            EditButtonComponent={EntityEditModalButton}
            isDeletable={true}
            repository={entitiesRepository}
            selectedObjectRoute={"/entity/"}
        />
    );
}
