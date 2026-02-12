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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonModalBody = PersonModalBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
const BussinesObjectSelectors_1 = require("../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const personsV2Helpers_1 = require("../personsV2Helpers");
function PersonModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    const [v2Loading, setV2Loading] = (0, react_1.useState)(false);
    const [accountV2, setAccountV2] = (0, react_1.useState)(null);
    const [profileV2, setProfileV2] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const resetData = {
            _entity: initialData?._entity || null,
            name: initialData?.name || "",
            surname: initialData?.surname || "",
            position: initialData?.position || "",
            email: initialData?.email || "",
            cellPhone: initialData?.cellPhone || "",
            phone: initialData?.phone || "",
            comment: initialData?.comment || "",
            //systemRoleId: initialData?.systemRoleId,
            //systemEmail: initialData?.systemEmail,
            //googleId: initialData?.googleId,
            //googleRefreshToken: initialData?.googleRefreshToken,
        };
        reset(resetData);
        trigger();
        // Przy edycji pobierz dane z endpointow v2 (account + profile)
        if (isEditing && initialData?.id) {
            let cancelled = false;
            setV2Loading(true);
            Promise.all([
                (0, personsV2Helpers_1.fetchPersonAccountV2)(initialData.id),
                (0, personsV2Helpers_1.fetchPersonProfileV2)(initialData.id),
            ])
                .then(([accountData, profileData]) => {
                if (cancelled)
                    return;
                // Zapisz account i profile do lokalnego stanu
                // (pola account sa zakomentowane w formularzu -- dane na potrzeby przyszlego write path FE-PV2-06)
                setAccountV2(accountData);
                setProfileV2(profileData);
            })
                .catch((error) => {
                if (!cancelled) {
                    console.error("PersonModalBody: blad ladowania danych v2:", error);
                }
            })
                .finally(() => {
                if (!cancelled)
                    setV2Loading(false);
            });
            return () => {
                cancelled = true;
            };
        }
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        v2Loading && (react_1.default.createElement("div", { className: "text-muted small mb-2 d-flex align-items-center" },
            react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
            "Ladowanie danych konta...")),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Podmiot"),
            react_1.default.createElement(BussinesObjectSelectors_1.EntitySelector, { name: "_entity", multiple: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Imi\u0119"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj imi\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register("name") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "name", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "surname" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwisko"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj nazwisko", isInvalid: !!errors?.surname, isValid: !errors?.surname, ...register("surname") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "surname", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "email" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Email"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "email", placeholder: "Podaj email", isInvalid: !!errors?.email, isValid: !errors?.email, ...register("email") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "email", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "position" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Stanowisko"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj stanowisko", isInvalid: !!errors?.position, isValid: !errors?.position, ...register("position") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "position", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "cellPhone" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Telefon kom\u00F3rkowy"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj numer kom\u00F3rki", isInvalid: !!errors?.cellPhone, isValid: !errors?.cellPhone, ...register("cellPhone") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "cellPhone", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "phone" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Telefon"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: "Podaj numer telefonu", isInvalid: !!errors?.phone, isValid: !errors?.phone, ...register("phone") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "phone", errors: errors }))));
}
