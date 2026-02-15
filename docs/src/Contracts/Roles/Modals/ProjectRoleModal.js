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
exports.ProjectRoleModalBody = void 0;
const react_1 = __importStar(require("react"));
const FormContext_1 = require("../../../View/Modals/FormContext");
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const CommonRoleFieldsModalBody_1 = require("./CommonRoleFieldsModalBody");
function ProjectRoleModalBody(props) {
    const { isEditing, initialData } = props;
    const { setValue, reset, trigger } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        setValue("_project", initialData?._project, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(BussinesObjectSelectors_1.ProjectSelector, { name: "_project" }),
        react_1.default.createElement(CommonRoleFieldsModalBody_1.CommonRoleFieldsModalBody, { ...props })));
}
exports.ProjectRoleModalBody = ProjectRoleModalBody;
