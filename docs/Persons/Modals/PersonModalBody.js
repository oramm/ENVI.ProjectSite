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
exports.PersonModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const PersonsController_1 = require("../PersonsController");
function PersonModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { dirtyFields, errors, isValid }, trigger } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            _entity: initialData?._entity,
            name: initialData?.name,
            surname: initialData?.surname,
            position: initialData?.position,
            email: initialData?.email,
            cellphone: initialData?.cellphone,
            phone: initialData?.phone,
            comment: initialData?.comment,
            systemRoleId: initialData?.systemRoleId,
            systemEmail: initialData?.systemEmail,
            googleId: initialData?.googleId,
            googleRefreshToken: initialData?.googleRefreshToken
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Odbiorcy"),
            react_1.default.createElement(CommonFormComponents_1.MyAsyncTypeahead, { name: '_entity', labelKey: 'name', repository: PersonsController_1.entitiesRepository, multiple: false }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { errors: errors, name: '_entity' })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Imi\u0119"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj imi\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register('name') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'name', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "surname" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwisko"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj nazwisko", isInvalid: !!errors?.surname, isValid: !errors?.surname, ...register('surname') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'surname', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "position" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Stanowisko"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj stanowisko", isInvalid: !!errors?.position, isValid: !errors?.position, ...register('position') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'position', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "email" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Email"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "email", placeholder: "Podaj email", isInvalid: !!errors?.email, isValid: !errors?.email, ...register('email') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'email', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "cellphone" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Telefon kom\u00F3rkowy"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj numer kom\u00F3rki", isInvalid: !!errors?.cellphone, isValid: !errors?.cellphone, ...register('cellphone') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'cellphone', errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "phone" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Telefon"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj numer telefonu", isInvalid: !!errors?.phone, isValid: !errors?.phone, ...register('phone') }),
            react_1.default.createElement(CommonFormComponents_1.ErrorMessage, { name: 'phone', errors: errors }))));
}
exports.PersonModalBody = PersonModalBody;
