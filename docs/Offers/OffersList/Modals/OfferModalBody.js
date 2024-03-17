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
exports.OfferModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const OffersController_1 = require("../OffersController");
const CitiesController_1 = require("../../../Admin/Cities/CitiesController");
function OfferModalBody({ isEditing, initialData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            _city: initialData?._city,
            _type: initialData?._type,
            _employer: initialData?.employerName || "",
            alias: initialData?.alias || "",
            description: initialData?.description || "",
            creationDate: initialData?.creationDate || new Date().toISOString().slice(0, 10),
            submissionDeadline: initialData?.submissionDeadline,
            status: initialData?.status || "",
            bidProcedure: initialData?.bidProcedure || "",
            form: initialData?.form || "",
            _editor: initialData?._editor,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "_city" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Miasto"),
                react_1.default.createElement(CommonFormComponents_1.CitySelectFormElement, { repository: CitiesController_1.citiesRepository, showValidationInfo: true, allowNew: true })),
            !isEditing && (react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "_type" },
                react_1.default.createElement(CommonFormComponents_1.ContractTypeSelectFormElement, { typesToInclude: "our" })))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zamawiaj\u0105cy"),
            react_1.default.createElement(CommonFormComponents_1.MyAsyncTypeahead, { name: "_employer", labelKey: "name", repository: OffersController_1.entitiesRepository, multiple: false }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: "_employer" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "alias" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Alias"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj alias", isValid: !errors?.alias, isInvalid: !!errors?.alias, ...register("alias") }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: "alias" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "description", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Uwagi"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj uwagi", isValid: !errors?.comment, isInvalid: !!errors?.comment, ...register("comment") }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "comment", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "creationDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data utworzenia"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.creationDate, isInvalid: !!errors.creationDate, ...register("creationDate") }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "creationDate", errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "submissionDeadline" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Termin sk\u0142adania"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.submissionDeadline, isInvalid: !!errors.submissionDeadline, ...register("submissionDeadline") }),
                react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: "submissionDeadline", errors: errors }))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(CommonFormComponents_1.OfferBidProcedureSelectFormElement, { as: react_bootstrap_1.Col }),
            react_1.default.createElement(CommonFormComponents_1.OfferFormSelectFormElement, { as: react_bootstrap_1.Col })),
        react_1.default.createElement(CommonFormComponents_1.OfferStatusSelectFormElement, null)));
}
exports.OfferModalBody = OfferModalBody;
