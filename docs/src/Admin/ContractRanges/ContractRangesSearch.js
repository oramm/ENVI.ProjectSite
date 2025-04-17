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
const ContractRangeModalButtons_1 = require("./Modals/ContractRangeModalButtons");
const ContractRangesController_1 = require("./ContractRangesController");
const ContractRangeFilterBody_1 = require("./ContractRangeFilterBody");
function ContractRangesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function buildLabelFromContractRanges(contractRanges) {
        if (!contractRanges || contractRanges.length === 0)
            return "";
        let label = "";
        for (let i = 0; i < contractRanges.length - 1; i++) {
            label += contractRanges[i].name + "\n ";
        }
        label += contractRanges[contractRanges.length - 1].name;
        return label;
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "contractRanges", title: title, FilterBodyComponent: ContractRangeFilterBody_1.ContractRangeFilterBody, tableStructure: [
            { header: "Nazwa", objectAttributeToShow: "name" },
            { header: "Opis", objectAttributeToShow: "description" },
        ], AddNewButtonComponents: [ContractRangeModalButtons_1.ContractRangeAddNewModalButton], EditButtonComponent: ContractRangeModalButtons_1.ContractRangeEditModalButton, isDeletable: true, repository: ContractRangesController_1.contractRangesRepository, selectedObjectRoute: "/contractRange/" }));
}
exports.default = ContractRangesSearch;
