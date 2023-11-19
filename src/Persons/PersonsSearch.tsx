import React, { useEffect } from 'react';
import FilterableTable from '../View/Resultsets/FilterableTable/FilterableTable';
import { Entity, Person } from '../../Typings/bussinesTypes';
import { PersonsFilterBody } from './PersonFilterBody';
import { PersonAddNewModalButton, PersonEditModalButton } from './Modals/PersonModalButtons';
import { personsRepository } from './PersonsController';

export default function PersonsSearch({ title }: { title: string }) {
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
        <FilterableTable<Person>
            id='persons'
            title={title}
            FilterBodyComponent={PersonsFilterBody}
            tableStructure={[
                { header: 'Imię', objectAttributeToShow: 'name' },
                { header: 'Nazwisko', objectAttributeToShow: 'surname' },
                { header: 'Telefon', objectAttributeToShow: 'phone' },
                { header: 'Email', objectAttributeToShow: 'email' },
                { header: 'Stanowisko', objectAttributeToShow: 'position' },
                { header: 'Opis', objectAttributeToShow: 'comment' }
            ]}
            AddNewButtonComponents={[PersonAddNewModalButton]}
            EditButtonComponent={PersonEditModalButton}
            isDeletable={true}
            repository={personsRepository}
            selectedObjectRoute={'/person/'}
        />
    );
}