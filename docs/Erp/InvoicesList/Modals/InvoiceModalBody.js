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
exports.InvoiceModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const InvoicesController_1 = require("../InvoicesController");
function InvoiceModalBody({ isEditing, initialData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    const statuses = [];
    statuses.push(MainSetupReact_1.default.InvoiceStatuses.FOR_LATER, MainSetupReact_1.default.InvoiceStatuses.TO_CORRECT, MainSetupReact_1.default.InvoiceStatuses.WITHDRAWN);
    if (initialData?.status && !statuses.includes(initialData.status))
        statuses.push(initialData.status);
    const status = watch("status");
    function setInitialOwner() {
        if (isEditing)
            return initialData?._owner;
        return MainSetupReact_1.default.getCurrentUserAsPerson();
    }
    (0, react_1.useEffect)(() => {
        console.log("InvoiceModalBody useEffect", initialData);
        const resetData = {
            _contract: initialData?._contract,
            issueDate: initialData?.issueDate || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            _entity: initialData?._entity,
            status: initialData?.status || "Na później",
            _owner: setInitialOwner(),
            _editor: MainSetupReact_1.default.getCurrentUserAsPerson(),
            description: initialData?.description || "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_contract" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wybierz kontrakt"),
            react_1.default.createElement(CommonFormComponents_1.ContractSelectFormElement, { name: "_contract", repository: InvoicesController_1.contractsRepository, typesToInclude: "our", readOnly: !isEditing })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "issueDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data utworzenia"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.issueDate, isInvalid: !!errors.issueDate, ...register("issueDate") }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "issueDate", errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "daysToPay" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Dni do zap\u0142aty"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", isValid: !errors.daysToPay, isInvalid: !!errors.daysToPay, min: "1", max: "60", ...register("daysToPay") }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "daysToPay", errors: errors }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", isValid: !errors.status, isInvalid: !!errors.status, ...register("status") },
                react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
                statuses.map((statusName, index) => (react_1.default.createElement("option", { key: index, value: statusName }, statusName)))),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: "status" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Odbiorca"),
            react_1.default.createElement(CommonFormComponents_1.MyAsyncTypeahead, { name: "_entity", labelKey: "name", repository: InvoicesController_1.entitiesRepository, multiple: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_owner" },
            react_1.default.createElement(CommonFormComponents_1.PersonSelectFormElement, { label: "Osoba rejestruj\u0105ca", name: "_owner", repository: MainSetupReact_1.default.personsEnviRepository })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj komentarz", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "description", errors: errors }))));
}
exports.InvoiceModalBody = InvoiceModalBody;
