"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const CityModalButtons_1 = require("./Modals/CityModalButtons");
const CitiesController_1 = require("./CitiesController");
const CityFilterBody_1 = require("./CityFilterBody");
function CitiesSearch({ title }) {
    function buildLabelFromCities(cities) {
        if (!cities || cities.length === 0)
            return '';
        let label = '';
        for (let i = 0; i < cities.length - 1; i++) {
            label += cities[i].name + '\n ';
        }
        label += cities[cities.length - 1].name;
        return label;
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'cities', title: title, FilterBodyComponent: CityFilterBody_1.CitiesFilterBody, tableStructure: [
            { header: 'Nazwa', objectAttributeToShow: 'name' },
            { header: 'Oznaczenie', objectAttributeToShow: 'code' },
        ], AddNewButtonComponents: [CityModalButtons_1.CityAddNewModalButton], EditButtonComponent: CityModalButtons_1.CityEditModalButton, isDeletable: true, repository: CitiesController_1.citiesRepository, selectedObjectRoute: '/city/' }));
}
exports.default = CitiesSearch;
