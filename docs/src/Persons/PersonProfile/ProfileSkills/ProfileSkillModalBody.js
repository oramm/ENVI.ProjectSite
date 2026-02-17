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
exports.ProfileSkillModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_hook_form_1 = require("react-hook-form");
const react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const personsV2Helpers_1 = require("../../personsV2Helpers");
const LEVEL_OPTIONS = [
    { value: "", label: "-- wybierz --" },
    { value: "BEGINNER", label: "Początkujący" },
    { value: "INTERMEDIATE", label: "Średniozaawansowany" },
    { value: "ADVANCED", label: "Zaawansowany" },
    { value: "EXPERT", label: "Ekspert" },
];
function ProfileSkillModalBody({ isEditing, initialData }) {
    const { register, reset, setValue, control, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [options, setOptions] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const resetData = {
            skillId: initialData?.skillId,
            levelCode: initialData?.levelCode || "",
            yearsOfExperience: initialData?.yearsOfExperience,
            _selectedSkill: initialData?._skill ? [initialData._skill] : [],
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    const handleSearch = (0, react_1.useCallback)(async (query) => {
        setIsLoading(true);
        try {
            const results = await (0, personsV2Helpers_1.fetchSkillsDictionary)(query);
            setOptions(results);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    function handleSkillChange(selected) {
        setValue("_selectedSkill", selected);
        if (selected.length > 0) {
            setValue("skillId", selected[0].id);
        }
        else {
            setValue("skillId", undefined);
        }
        trigger("skillId");
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "skillId", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Specjalizacja"),
            react_1.default.createElement(react_hook_form_1.Controller, { name: "_selectedSkill", control: control, render: ({ field }) => (react_1.default.createElement(react_bootstrap_typeahead_1.AsyncTypeahead, { id: "profileSkill-asyncTypeahead", labelKey: "name", multiple: false, isLoading: isLoading, onSearch: handleSearch, options: options, onChange: (selected) => handleSkillChange(selected), selected: field.value || [], placeholder: "Wpisz nazw\u0119 specjalizacji...", minLength: 1, isInvalid: !!errors?.skillId, renderMenuItemChildren: (option) => {
                        const skill = option;
                        return react_1.default.createElement("span", null, skill.name);
                    } })) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "skillId", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "levelCode", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Poziom"),
            react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("levelCode") }, LEVEL_OPTIONS.map((opt) => (react_1.default.createElement("option", { key: opt.value, value: opt.value }, opt.label))))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "yearsOfExperience", className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Lata do\u015Bwiadczenia"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", min: 0, max: 50, placeholder: "np. 5", isInvalid: !!errors?.yearsOfExperience, isValid: !errors?.yearsOfExperience, ...register("yearsOfExperience", { valueAsNumber: true }) }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "yearsOfExperience", errors: errors }))));
}
exports.ProfileSkillModalBody = ProfileSkillModalBody;
