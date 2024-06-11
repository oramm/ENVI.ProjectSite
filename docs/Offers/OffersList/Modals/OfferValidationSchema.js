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
exports.makeOtherOfferValidationSchema = exports.makeOurOfferValidationSchema = void 0;
const Yup = __importStar(require("yup"));
function makeCommonFields(isEditing) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
        _city: Yup.mixed()
            .test("is-object-or-string", "Wybierz lub dodaj Miasto", (value) => typeof value === "object" || typeof value === "string")
            .test("string-length", "Nazwa może mieć maksymalnie 150 znaków", (value) => typeof value !== "string" || value.length <= 150)
            .required("Wybierz podmiot"),
        _type: Yup.object().required("Wybierz typ kontaktu"),
        alias: Yup.string().required("Nazwa jest wymagana").max(20, "Nazwa może mieć maksymalnie 20 znaków"),
        description: Yup.string().required("Podaj opis ofety").max(500, "Opis może mieć maksymalnie 500 znaków"),
        comment: Yup.string().max(500, "Uwagi mogą mieć maksymalnie 500 znaków"),
        creationDate: isEditing
            ? Yup.date().required("Podaj datę utworzenia")
            : Yup.date().required("Podaj datę utworzenia").max(tomorrow, "Data utworzenia nie może być z przyszłości"),
        submissionDeadline: isEditing
            ? Yup.date().required("Podaj termin składania")
            : Yup.date()
                .required("Podaj termin składania")
                .min(thirtyDaysAgo, "Termin składania nie może być z przeszłości"),
        bidProcedure: Yup.string().required("Wybierz procedurę"),
        form: Yup.string().required("Wybierz formę wysyłki"),
        _employer: Yup.mixed()
            .required("Wybierz podmiot")
            .test("is-object-or-string", "Wybierz podmiot lub podaj nazwę", (value) => typeof value === "object" || typeof value === "string")
            .test("string-length", "Nazwa może mieć maksymalnie 150 znaków", (value) => typeof value !== "string" || value.length <= 150),
        status: Yup.string().required("Wybierz status oferty"),
    };
}
function makeOurOfferValidationSchema(isEditing) {
    return Yup.object().shape({
        ...makeCommonFields(isEditing),
    });
}
exports.makeOurOfferValidationSchema = makeOurOfferValidationSchema;
function makeOtherOfferValidationSchema(isEditing) {
    return Yup.object().shape({
        ...makeCommonFields(isEditing),
        tenderUrl: Yup.string()
            .url("Podaj poprawny link")
            .max(255, "Link jest za długi")
            .matches(/^(https?:\/\/)?([\da-z.-]+\.)+[a-z]{2,}(\/[\w ,.-]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[\w]*)?$/, "Podaj poprawny link")
            .nullable()
            .notRequired()
            .test("ignore-min-if-empty", "Link jest za krótki", (value) => {
            if (!value)
                return true; // Skip the test if value is empty or null
            return value.length >= 10;
        }),
    });
}
exports.makeOtherOfferValidationSchema = makeOtherOfferValidationSchema;
