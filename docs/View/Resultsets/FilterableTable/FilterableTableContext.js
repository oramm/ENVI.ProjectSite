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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFilterableTableContext = exports.FilterableTableProvider = exports.FilterableTableContext = void 0;
const react_1 = __importStar(require("react"));
exports.FilterableTableContext = (0, react_1.createContext)({
    id: '',
    objects: [],
    sections: [],
    repository: {},
    tableStructure: [],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    handleAddSection: () => { },
    handleEditSection: () => { },
    handleDeleteSection: () => { },
    setSections: () => { },
    selectedObjectRoute: '',
    activeRowId: 0,
    activeSectionId: '',
    EditButtonComponent: undefined,
    isDeletable: true,
    externalUpdate: 0,
});
function FilterableTableProvider({ id, objects, setObjects, repository, handleAddObject, handleEditObject, handleDeleteObject, sections, setSections, handleAddSection, handleEditSection, handleDeleteSection, tableStructure, selectedObjectRoute, activeRowId, activeSectionId, EditButtonComponent, isDeletable = true, externalUpdate, children, }) {
    const FilterableTableContextGeneric = exports.FilterableTableContext;
    return react_1.default.createElement(FilterableTableContextGeneric.Provider, { value: {
            id,
            objects,
            setObjects: setObjects,
            repository,
            sections,
            setSections: setSections,
            handleAddSection,
            handleEditSection,
            handleDeleteSection,
            tableStructure,
            handleAddObject,
            handleEditObject,
            handleDeleteObject,
            selectedObjectRoute,
            activeRowId,
            activeSectionId,
            EditButtonComponent,
            isDeletable,
            externalUpdate,
        } }, children);
}
exports.FilterableTableProvider = FilterableTableProvider;
function useFilterableTableContext() {
    const context = react_1.default.useContext(exports.FilterableTableContext);
    if (!context) {
        throw new Error('useMyContext must be used under MyContextProvider');
    }
    return context;
}
exports.useFilterableTableContext = useFilterableTableContext;
