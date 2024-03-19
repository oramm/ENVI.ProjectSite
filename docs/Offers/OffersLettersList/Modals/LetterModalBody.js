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
exports.LetterModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const LettersController_1 = require("../LettersController");
function LetterModalBody({ isEditing, initialData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    const _offer = watch("_offer");
    const creationDate = watch("creationDate");
    const registrationDate = watch("registrationDate");
    (0, react_1.useEffect)(() => {
        const resetData = {
            _offer: initialData?._offer,
            _cases: initialData?._cases || [],
            description: initialData?.description || "",
            creationDate: initialData?.creationDate || new Date().toISOString().slice(0, 10),
            registrationDate: initialData?.registrationDate || new Date().toISOString().slice(0, 10),
            _editor: initialData?._editor,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    (0, react_1.useEffect)(() => {
        if (!dirtyFields._offer)
            return;
        setValue("_cases", undefined, { shouldValidate: true });
    }, [_offer, _offer?.id, setValue]);
    (0, react_1.useEffect)(() => {
        trigger(["creationDate", "registrationDate"]);
    }, [trigger, watch, creationDate, registrationDate]);
    (0, react_1.useEffect)(() => {
        setValue("registrationDate", creationDate);
    }, [setValue, creationDate]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_offer" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wybierz ofert\u0119"),
            react_1.default.createElement(CommonFormComponents_1.OfferSelectFormElement, { name: "_offer", repository: LettersController_1.offersRepository, readOnly: !isEditing })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Dotyczy spraw"),
            _offer ? (react_1.default.createElement(CommonFormComponents_1.CaseSelectMenuElement, { name: "_cases", repository: LettersController_1.casesRepository, _offer: _offer, readonly: !_offer })) : (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "warning" }, "Wybierz ofert\u0119, by przypisa\u0107 do spraw"))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "description", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "creationDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data utworzenia"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.creationDate, isInvalid: !!errors.creationDate, ...register("creationDate") }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "creationDate", errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "registrationDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data Nadania"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.registrationDate, isInvalid: !!errors.registrationDate, ...register("registrationDate") }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "registrationDate", errors: errors }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_editor" },
            react_1.default.createElement(CommonFormComponents_1.PersonSelectFormElement, { label: "Osoba rejestruj\u0105ca", name: "_editor", repository: MainSetupReact_1.default.personsEnviRepository })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "file" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Plik"),
            react_1.default.createElement(CommonFormComponents_1.FileInput, { acceptedFileTypes: "application/msword, application/vnd.ms-excel, application/pdf", ...register("file") }))));
}
exports.LetterModalBody = LetterModalBody;
