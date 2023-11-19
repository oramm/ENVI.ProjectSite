import React, { useEffect } from 'react';
import FilterableTable from '../View/Resultsets/FilterableTable/FilterableTable';
import { Entity } from '../../Typings/bussinesTypes';
import { EntityAddNewModalButton, EntityEditModalButton } from './Modals/EntityModalButtons';
import { entitiesRepository } from './EntitiesController';
import { EntitiesFilterBody } from './EntityFilterBody';

export default function EntitiesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function buildLabelFromEntities(entities: Entity[]): string {
        if (!entities || entities.length === 0) return '';

        let label = '';
        for (let i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + '\n ';
        }
        label += entities[entities.length - 1].name;

        return label;
    }

    function makeEntitiesLabel(entity: Entity) {
        const mainEntitiesLabel = buildLabelFromEntities(entity._entitiesMain);
        const ccEntitiesLabel = buildLabelFromEntities(entity._entitiesCc);

        if (!mainEntitiesLabel) return <></>;

        let label = mainEntitiesLabel;
        if (ccEntitiesLabel?.length > 0) {
            label += '\n\nDW: ' + ccEntitiesLabel;
        }

        return <div style={{ whiteSpace: 'pre-line' }}>{label}</div>;

    }

    return (
        <FilterableTable<Entity>
            id='entities'
            title={title}
            FilterBodyComponent={EntitiesFilterBody}
            tableStructure={[
                { header: 'Nazwa', objectAttributeToShow: 'name' },
                { header: 'Adres', objectAttributeToShow: 'address' },
                { header: 'NIP', objectAttributeToShow: 'taxNumber' },
                { header: 'Telefon', objectAttributeToShow: 'phone' },
            ]}
            AddNewButtonComponents={[EntityAddNewModalButton]}
            EditButtonComponent={EntityEditModalButton}
            isDeletable={true}
            repository={entitiesRepository}
            selectedObjectRoute={'/entity/'}
        />
    );
}