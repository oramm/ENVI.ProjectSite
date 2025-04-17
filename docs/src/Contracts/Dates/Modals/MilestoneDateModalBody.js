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
exports.MilestoneDateModalBody = void 0;
const react_1 = __importStar(require("react"));
const FormContext_1 = require("../../../View/Modals/FormContext");
const react_bootstrap_1 = require("react-bootstrap");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const CommonComponentsController_1 = require("../../../View/Resultsets/CommonComponentsController");
function MilestoneDateModalBody(props) {
    const { isEditing, initialData } = props;
    const { register, reset, setValue, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            id: initialData?.id,
            _milestone: initialData?._milestone,
            description: initialData?.description || "",
            startDate: initialData?.startDate.split("T")[0] || "",
            endDate: initialData?.endDate.split("T")[0] || "",
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    function hasAnyDateError(errors) {
        return (0, CommonComponentsController_1.hasError)(errors, `startDate`) || (0, CommonComponentsController_1.hasError)(errors, `endDate`);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj opis do tego terminu", isInvalid: !!errors?.description, isValid: !errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-2" },
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: `startDate` },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data rozpocz\u0119cia"),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isInvalid: hasAnyDateError(errors), isValid: !hasAnyDateError(errors), ...register(`startDate`) }),
                    react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: `startDate`, errors: errors }))),
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: `endDate` },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data zako\u0144czenia"),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isInvalid: hasAnyDateError(errors), isValid: !hasAnyDateError(errors), ...register(`endDate`) }),
                    react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: `endDate`, errors: errors }))))));
}
exports.MilestoneDateModalBody = MilestoneDateModalBody;
