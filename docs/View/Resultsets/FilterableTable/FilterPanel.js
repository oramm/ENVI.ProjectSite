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
exports.FilterPanel = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_hook_form_1 = require("react-hook-form");
const FormContext_1 = require("../../Modals/FormContext");
const CommonComponentsController_1 = require("../CommonComponentsController");
const FilterableTableContext_1 = require("./FilterableTableContext");
function FilterPanel({ FilterBodyComponent, repository, onIsReadyChange, locaFilter = false, }) {
    const { setObjects, objects, externalUpdate } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const [originalObjects, setOriginalObjects] = (0, react_1.useState)([]);
    const formMethods = (0, react_hook_form_1.useForm)({ defaultValues: {}, mode: 'onChange' });
    (0, react_1.useEffect)(() => {
        setOriginalObjects(objects);
    }, [externalUpdate]);
    async function handleSubmitSearch(data) {
        let result = [];
        onIsReadyChange(false);
        if (locaFilter)
            result = handleLocalFilter(data);
        else {
            const formData = (0, CommonComponentsController_1.parseFieldValuesToParams)(data);
            result = await repository.loadItemsFromServer(formData);
            await handleServerSearch(data);
        }
        setObjects(result);
        onIsReadyChange(true);
    }
    ;
    async function handleServerSearch(data) {
        onIsReadyChange(false);
        const formData = (0, CommonComponentsController_1.parseFieldValuesToParams)(data);
        const result = await repository.loadItemsFromServer(formData);
        setObjects(result);
        onIsReadyChange(true);
    }
    ;
    function handleLocalFilter(filterFormData) {
        return originalObjects.filter(item => {
            for (let key in filterFormData) {
                const filterValue = filterFormData[key];
                if (!filterValue)
                    continue;
                const itemValue = item[key];
                // Jeśli wartość w elemencie jest obiektem, porównaj za pomocą labelKey
                if (typeof itemValue === 'object' && itemValue !== null) {
                    const labelKey = itemValue.labelKey;
                    // Jeśli wartość filtra nie pasuje do wartości labelKey w obiekcie, zwróć false
                    if (String(itemValue[labelKey]).toLowerCase().includes(String(filterValue).toLowerCase()) === false) {
                        return false;
                    }
                }
                else {
                    // Jeśli wartość w elemencie nie jest obiektem, porównaj bezpośrednio
                    // Jeśli wartość filtra nie pasuje do wartości w obiekcie, zwróć false
                    if (String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase()) === false) {
                        return false;
                    }
                }
            }
            // Jeśli wszystkie pola pasują, zwróć true
            return true;
        });
    }
    return (react_1.default.createElement(FormContext_1.FormProvider, { value: formMethods },
        react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: formMethods.handleSubmit(handleSubmitSearch) },
            react_1.default.createElement(FilterBodyComponent, null),
            react_1.default.createElement(react_bootstrap_1.Row, { xl: 1 },
                react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
                    react_1.default.createElement(react_bootstrap_1.Button, { type: "submit" }, "Szukaj"))))));
}
exports.FilterPanel = FilterPanel;
