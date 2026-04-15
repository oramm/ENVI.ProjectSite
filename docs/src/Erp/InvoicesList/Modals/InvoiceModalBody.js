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
exports.InvoiceModalBody = InvoiceModalBody;
const react_1 = __importStar(require("react"));
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const THIRD_PARTY_ROLE_OPTIONS = [
    { value: 1, label: "1 - Faktor" },
    { value: 2, label: "2 - Odbiorca" },
    { value: 3, label: "3 - Podmiot pierwotny" },
    { value: 4, label: "4 - Dodatkowy nabywca" },
    { value: 5, label: "5 - Wystawca faktury" },
    { value: 6, label: "6 - Dokonujący płatności" },
    { value: 7, label: "7 - JST wystawca" },
    { value: 8, label: "8 - JST odbiorca" },
    { value: 9, label: "9 - Członek GV wystawca" },
    { value: 10, label: "10 - Członek GV odbiorca" },
];
function InvoiceModalBody({ isEditing, initialData, contextData: contextData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    const statuses = [];
    statuses.push(MainSetupReact_1.default.InvoiceStatuses.FOR_LATER, MainSetupReact_1.default.InvoiceStatuses.TO_CORRECT, MainSetupReact_1.default.InvoiceStatuses.WITHDRAWN);
    if (initialData?.status && !statuses.includes(initialData.status))
        statuses.push(initialData.status);
    const includeThirdParty = watch("includeThirdParty");
    const isJstSubordinate = watch("isJstSubordinate");
    const isGvMember = watch("isGvMember");
    const addAnotherThirdParty = watch("addAnotherThirdParty");
    const thirdParties = (watch("_thirdParties") || []);
    const prevIsJstSubordinateRef = (0, react_1.useRef)(false);
    const prevIsGvMemberRef = (0, react_1.useRef)(false);
    function setInitialOwner() {
        if (isEditing)
            return initialData?._owner;
        return MainSetupReact_1.default.getCurrentUserAsPerson();
    }
    function appendThirdParty(role = null) {
        const current = (watch("_thirdParties") || []).slice();
        current.push({ role, _entity: null });
        setValue("_thirdParties", current, { shouldDirty: true, shouldValidate: true });
    }
    function removeThirdParty(index) {
        const current = (watch("_thirdParties") || []).slice();
        current.splice(index, 1);
        setValue("_thirdParties", current, { shouldDirty: true, shouldValidate: true });
    }
    (0, react_1.useEffect)(() => {
        console.log("InvoiceModalBody useEffect", initialData);
        const typedContextData = contextData;
        const _entity = initialData?._entity || (typedContextData?._employers && typedContextData._employers[0]);
        const resetData = {
            _contract: initialData?._contract || contextData,
            issueDate: initialData?.issueDate || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            _entity,
            status: initialData?.status || "Na później",
            _owner: setInitialOwner(),
            _editor: MainSetupReact_1.default.getCurrentUserAsPerson(),
            description: initialData?.description || "",
            isJstSubordinate: initialData?.isJstSubordinate ?? false,
            isGvMember: initialData?.isGvMember ?? false,
            includeThirdParty: initialData?.includeThirdParty ?? false,
            _thirdParties: initialData?._thirdParties && initialData._thirdParties.length > 0
                ? initialData._thirdParties
                : initialData?._thirdParty
                    ? [{ role: initialData?.isJstSubordinate ? 8 : initialData?.isGvMember ? 10 : null, _entity: initialData._thirdParty }]
                    : [],
            addAnotherThirdParty: false,
        };
        reset(resetData);
        prevIsJstSubordinateRef.current = Boolean(resetData.isJstSubordinate);
        prevIsGvMemberRef.current = Boolean(resetData.isGvMember);
        trigger();
    }, [initialData, reset]);
    (0, react_1.useEffect)(() => {
        if (!includeThirdParty) {
            setValue("_thirdParties", [], { shouldDirty: false, shouldValidate: true });
            setValue("thirdPartyEntityId", null, { shouldDirty: false });
            setValue("_thirdParty", null, { shouldDirty: false });
            setValue("addAnotherThirdParty", false, { shouldDirty: false });
        }
        else if (thirdParties.length === 0) {
            appendThirdParty();
        }
    }, [includeThirdParty, thirdParties.length, setValue]);
    (0, react_1.useEffect)(() => {
        if (addAnotherThirdParty) {
            appendThirdParty();
            setValue("addAnotherThirdParty", false, { shouldDirty: false });
        }
    }, [addAnotherThirdParty, setValue]);
    (0, react_1.useEffect)(() => {
        if (isJstSubordinate && !prevIsJstSubordinateRef.current) {
            setValue("includeThirdParty", true, { shouldDirty: true, shouldValidate: true });
            appendThirdParty(8);
        }
        prevIsJstSubordinateRef.current = Boolean(isJstSubordinate);
    }, [isJstSubordinate, setValue]);
    (0, react_1.useEffect)(() => {
        if (isGvMember && !prevIsGvMemberRef.current) {
            setValue("includeThirdParty", true, { shouldDirty: true, shouldValidate: true });
            appendThirdParty(10);
        }
        prevIsGvMemberRef.current = Boolean(isGvMember);
    }, [isGvMember, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_contract" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wybierz kontrakt"),
            react_1.default.createElement(BussinesObjectSelectors_1.ContractSelector, { name: "_contract", typesToInclude: "our", readOnly: !isEditing })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "issueDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data sprzeda\u017Cy"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.issueDate, isInvalid: !!errors.issueDate, ...register("issueDate") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "issueDate", errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "daysToPay" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Dni do zap\u0142aty"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", isValid: !errors.daysToPay, isInvalid: !!errors.daysToPay, min: "1", max: "60", ...register("daysToPay") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "daysToPay", errors: errors }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", isValid: !errors.status, isInvalid: !!errors.status, ...register("status") },
                react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
                statuses.map((statusName, index) => (react_1.default.createElement("option", { key: index, value: statusName }, statusName)))),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "status" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nabywca"),
            react_1.default.createElement(BussinesObjectSelectors_1.EntitySelector, { name: "_entity", multiple: false })),
        react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2 g-3 flex-nowrap overflow-auto pb-1" },
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xs: "auto", className: "mb-0", controlId: "isJstSubordinate" },
                react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", label: react_1.default.createElement("span", { className: "text-nowrap" }, "Dotyczy jednostki podrz\u0119dnej JST"), isInvalid: !!errors.isJstSubordinate, ...register("isJstSubordinate") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "isJstSubordinate", errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xs: "auto", className: "mb-0", controlId: "isGvMember" },
                react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", label: react_1.default.createElement("span", { className: "text-nowrap" }, "Dotyczy cz\u0142onka grupy VAT"), isInvalid: !!errors.isGvMember, ...register("isGvMember") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "isGvMember", errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xs: "auto", className: "mb-0", controlId: "includeThirdParty" },
                react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", label: react_1.default.createElement("span", { className: "text-nowrap" }, "Dodaj podmiot 3 do faktury"), isInvalid: !!errors.includeThirdParty, ...register("includeThirdParty") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "includeThirdParty", errors: errors }))),
        includeThirdParty && (react_1.default.createElement(react_1.default.Fragment, null,
            thirdParties.map((item, index) => (react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2", key: `third-party-${index}` },
                react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: `_thirdParties.${index}._entity` },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, `Podmiot 3 #${index + 1}`),
                    react_1.default.createElement(BussinesObjectSelectors_1.EntitySelector, { name: `_thirdParties.${index}._entity`, multiple: false })),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 4, controlId: `_thirdParties.${index}.role` },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Rola"),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", ...register(`_thirdParties.${index}.role`, {
                            setValueAs: (value) => (value === "" ? null : Number(value)),
                        }) },
                        react_1.default.createElement("option", { value: "" }, "-- Wybierz rol\u0119 --"),
                        THIRD_PARTY_ROLE_OPTIONS.map((option) => (react_1.default.createElement("option", { key: option.value, value: option.value }, option.label)))),
                    react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: `_thirdParties.${index}.role`, errors: errors })),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2, controlId: `removeThirdParty${index}` },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, { className: "invisible d-block" }, "Akcja"),
                    react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-danger", size: "sm", onClick: () => removeThirdParty(index), disabled: thirdParties.length <= 1 }, "Usu\u0144"))))),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "_thirdParties", errors: errors }))),
        includeThirdParty && thirdParties.length > 0 && thirdParties[thirdParties.length - 1]?._entity && (react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mt-2", controlId: "includeAdditionalThirdParty" },
            react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", label: "Czy doda\u0107 kolejny podmiot?", isInvalid: !!errors.addAnotherThirdParty, ...register("addAnotherThirdParty") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "addAnotherThirdParty", errors: errors }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_owner" },
            react_1.default.createElement(BussinesObjectSelectors_1.PersonSelectorPreloaded, { label: "Osoba rejestruj\u0105ca", name: "_owner", repository: MainSetupReact_1.default.personsEnviRepository })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj komentarz", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors }))));
}
