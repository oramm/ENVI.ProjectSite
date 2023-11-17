import React from 'react';
import FilterableTable from '../../View/Resultsets/FilterableTable/FilterableTable';
import { City } from '../../../Typings/bussinesTypes';
import { CityAddNewModalButton, CityEditModalButton } from './Modals/CityModalButtons';
import { citiesRepository } from './CitiesController';
import { CitiesFilterBody } from './CityFilterBody';

export default function CitiesSearch({ title }: { title: string }) {
    function buildLabelFromCities(cities: City[]): string {
        if (!cities || cities.length === 0) return '';

        let label = '';
        for (let i = 0; i < cities.length - 1; i++) {
            label += cities[i].name + '\n ';
        }
        label += cities[cities.length - 1].name;

        return label;
    }

    return (
        <FilterableTable<City>
            id='cities'
            title={title}
            FilterBodyComponent={CitiesFilterBody}
            tableStructure={[
                { header: 'Nazwa', objectAttributeToShow: 'name' },
                { header: 'Oznaczenie', objectAttributeToShow: 'code' },
            ]}
            AddNewButtonComponents={[CityAddNewModalButton]}
            EditButtonComponent={CityEditModalButton}
            isDeletable={true}
            repository={citiesRepository}
            selectedObjectRoute={'/city/'}
        />
    );
}