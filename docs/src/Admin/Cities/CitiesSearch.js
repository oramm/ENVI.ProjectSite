"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const CityModalButtons_1 = require("./Modals/CityModalButtons");
const CitiesController_1 = require("./CitiesController");
const CityFilterBody_1 = require("./CityFilterBody");
function CitiesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function buildLabelFromCities(cities) {
        if (!cities || cities.length === 0)
            return "";
        let label = "";
        for (let i = 0; i < cities.length - 1; i++) {
            label += cities[i].name + "\n ";
        }
        label += cities[cities.length - 1].name;
        return label;
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "cities", title: title, FilterBodyComponent: CityFilterBody_1.CitiesFilterBody, tableStructure: [
            { header: "Nazwa", objectAttributeToShow: "name" },
            { header: "Oznaczenie", objectAttributeToShow: "code" },
        ], AddNewButtonComponents: [CityModalButtons_1.CityAddNewModalButton], EditButtonComponent: CityModalButtons_1.CityEditModalButton, isDeletable: true, repository: CitiesController_1.citiesRepository, selectedObjectRoute: "/city/" }));
}
exports.default = CitiesSearch;
