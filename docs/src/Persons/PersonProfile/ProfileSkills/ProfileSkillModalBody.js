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
exports.ProfileSkillModalBody = ProfileSkillModalBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const RepositoryReact_1 = __importDefault(require("../../../React/RepositoryReact"));
const LEVEL_OPTIONS = [
    { value: "", label: "-- wybierz --" },
    { value: "BEGINNER", label: "Poczatkujacy" },
    { value: "INTERMEDIATE", label: "Sredniozaawansowany" },
    { value: "ADVANCED", label: "Zaawansowany" },
    { value: "EXPERT", label: "Ekspert" },
];
function ProfileSkillModalBody({ isEditing, initialData }) {
    const { register, watch, setValue, reset, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    const skillRepository = (0, react_1.useMemo)(() => new RepositoryReact_1.default({
        actionRoutes: {
            getRoute: "v2/skills/search",
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
        name: "profileSkillSelector_temp",
    }), []);
    const selectedSkill = watch("_skill");
    (0, react_1.useEffect)(() => {
        reset({
            _skill: initialData?._skill,
            skillId: initialData?.skillId,
            levelCode: initialData?.levelCode || "",
            yearsOfExperience: initialData?.yearsOfExperience,
        });
        trigger();
    }, [initialData, reset, trigger]);
    (0, react_1.useEffect)(() => {
        const mappedSkillId = selectedSkill?.id;
        setValue("skillId", mappedSkillId);
        trigger("skillId");
    }, [selectedSkill, setValue, trigger]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_skill", className: "mb-3" },
            react_1.default.createElement(BussinesObjectSelectors_1.SkillSelector, { name: "_skill", label: "Specjalizacja", multiple: false, repository: skillRepository }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "skillId", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "levelCode", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Poziom"),
            react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("levelCode") }, LEVEL_OPTIONS.map((opt) => (react_1.default.createElement("option", { key: opt.value, value: opt.value }, opt.label))))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "yearsOfExperience", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Lata doswiadczenia"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", min: 0, max: 50, placeholder: "np. 5", isInvalid: !!errors?.yearsOfExperience, isValid: !errors?.yearsOfExperience, ...register("yearsOfExperience", { valueAsNumber: true }) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "yearsOfExperience", errors: errors }))));
}
