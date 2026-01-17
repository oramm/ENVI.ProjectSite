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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterableTableContext = void 0;
exports.FilterableTableProvider = FilterableTableProvider;
exports.useFilterableTableContext = useFilterableTableContext;
const react_1 = __importStar(require("react"));
exports.FilterableTableContext = (0, react_1.createContext)({
    id: "",
    objects: [],
    sections: [],
    repository: {},
    tableStructure: [],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleCopyObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    handleAddSection: () => { },
    handleEditSection: () => { },
    handleDeleteSection: () => { },
    setSections: () => { },
    selectedObjectRoute: "",
    activeRowId: 0,
    activeSectionId: "",
    editingSectionId: "",
    activePathSet: new Set(),
    EditButtonComponent: undefined,
    isDeletable: true,
    isCopyable: false,
    externalUpdate: 0,
    shouldRetrieveDataBeforeEdit: false,
    specialRetrieveActionRoute: undefined,
    globalExpandTrigger: null,
    snapshotMode: "criteria+objects",
    sectionsFilterHandlers: undefined,
});
function FilterableTableProvider({ id, objects, setObjects, repository, handleAddObject, handleEditObject, handleDeleteObject, sections, setSections, handleAddSection, handleEditSection, handleCopyObject, handleDeleteSection, tableStructure, selectedObjectRoute, activeRowId, activeSectionId, editingSectionId, activePathSet, EditButtonComponent, isDeletable = true, isCopyable = false, externalUpdate, shouldRetrieveDataBeforeEdit = false, specialRetrieveActionRoute, globalExpandTrigger, snapshotMode, sectionsFilterHandlers, children, }) {
    const FilterableTableContextGeneric = exports.FilterableTableContext;
    return (react_1.default.createElement(FilterableTableContextGeneric.Provider, { value: {
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
            handleCopyObject,
            handleDeleteObject,
            selectedObjectRoute,
            activeRowId,
            activeSectionId,
            editingSectionId,
            activePathSet,
            EditButtonComponent,
            isDeletable,
            isCopyable,
            externalUpdate,
            shouldRetrieveDataBeforeEdit,
            specialRetrieveActionRoute,
            globalExpandTrigger,
            snapshotMode,
            sectionsFilterHandlers,
        } }, children));
}
function useFilterableTableContext() {
    const context = react_1.default.useContext(exports.FilterableTableContext);
    if (!context) {
        throw new Error("useMyContext must be used under MyContextProvider");
    }
    return context;
}
