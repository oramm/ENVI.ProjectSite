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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceIssueModalBody = InvoiceIssueModalBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const ToolsFetch_1 = __importDefault(require("../../../React/Tools/ToolsFetch"));
function InvoiceIssueModalBody({ initialData }) {
    const { register, reset, setValue, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        console.log("InvoiceModalBody useEffect", initialData);
        const resetData = {
            number: initialData?.number,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);
    (0, react_1.useEffect)(() => {
        let isCancelled = false;
        async function loadNextNumber() {
            try {
                if (initialData?.number) {
                    return;
                }
                const response = await ToolsFetch_1.default.fetchWithRetry(`${MainSetupReact_1.default.serverUrl}invoice/nextNumber`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        year: typeof initialData?.issueDate === "string"
                            ? Number(initialData.issueDate.slice(0, 4))
                            : undefined,
                    }),
                    credentials: "include",
                });
                const nextNumber = response?.number;
                if (!isCancelled && typeof nextNumber === "string" && nextNumber.trim()) {
                    setValue("number", nextNumber, {
                        shouldDirty: false,
                        shouldValidate: true,
                    });
                }
            }
            catch (error) {
                console.error("Nie udało się pobrać kolejnego numeru faktury", error);
            }
        }
        loadNextNumber();
        return () => {
            isCancelled = true;
        };
    }, [initialData?.id, initialData?.issueDate, initialData?.number, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "number" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Numer"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "input", isValid: !errors?.number, isInvalid: !!errors?.number, ...register("number") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "number", errors: errors }))));
}
