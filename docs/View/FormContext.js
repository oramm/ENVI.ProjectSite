"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormProvider = exports.useFormContext = void 0;
const react_1 = require("react");
const FormContext = (0, react_1.createContext)(null);
const useFormContext = () => {
    const context = (0, react_1.useContext)(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};
exports.useFormContext = useFormContext;
exports.FormProvider = FormContext.Provider;
