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
exports.useDashboardCardContext = exports.DashboardCardProvider = exports.DashboardCardContext = void 0;
const react_1 = __importStar(require("react"));
exports.DashboardCardContext = (0, react_1.createContext)({
    objects: [],
    repository: {},
    cardData: {},
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    selectedObjectRoute: "",
    activeRowId: 0,
    EditButtonComponent: undefined,
    isDeletable: true,
    shouldRetrieveDataBeforeEdit: false,
    specialRetrieveActionRoute: undefined,
});
function DashboardCardProvider({ objects, setObjects, repository, handleEditObject, handleDeleteObject, cardData, selectedObjectRoute, activeRowId, EditButtonComponent, isDeletable = true, shouldRetrieveDataBeforeEdit = true, specialRetrieveActionRoute, children, }) {
    const DashboardCardContextGeneric = exports.DashboardCardContext;
    return (react_1.default.createElement(DashboardCardContextGeneric.Provider, { value: {
            objects,
            setObjects: setObjects,
            repository,
            cardData,
            handleEditObject,
            handleDeleteObject,
            selectedObjectRoute,
            activeRowId,
            EditButtonComponent,
            isDeletable,
            shouldRetrieveDataBeforeEdit,
            specialRetrieveActionRoute,
        } }, children));
}
exports.DashboardCardProvider = DashboardCardProvider;
function useDashboardCardContext() {
    const context = react_1.default.useContext(exports.DashboardCardContext);
    if (!context) {
        throw new Error("useMyContext must be used under MyContextProvider");
    }
    return context;
}
exports.useDashboardCardContext = useDashboardCardContext;
