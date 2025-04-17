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
exports.makeProjectValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonFields = {
    name: Yup.string()
        .required("Nazwa jest wymagana")
        .min(3, "Nazwa musi mieć przynajmniej 3 znaki")
        .max(500, "Nazwa może mieć maksymalnie 150 znaków"),
    comment: Yup.string().max(1000, "Komentarz może mieć maksymalnie 1000 znaków"),
    alias: Yup.string().max(30, "Alias może mieć maksymalnie 30 znaków"),
    value: Yup.string(),
    status: Yup.string().required("Status jest wymagany"),
    startDate: Yup.date()
        .required("Data rozpoczęcia jest wymagana")
        .test("startDateValidation", "Początek musi być wcześniejszy niż zakończenie", function (value) {
        return this.parent.endDate > value;
    }),
    endDate: Yup.date()
        .required("Data zakończenia jest wymagana")
        .test("endDateValidation", "Koniec musi być późniejszy niż początek", function (value) {
        return value > this.parent.startDate;
    }),
    _contractors: Yup.array(),
    ourId: Yup.string()
        .required("Oznaczenie jest wymagane")
        .min(9, "Oznaczenie musi mieć przynajmniej 9 znaków z kropkami")
        .max(19, "Oznacznie może mieć maksymalnie 19 znaków")
        .test("threeCharsBeforeFirstDot", "Oznaczenie musi mieć 3 znaki przed pierwszą kropką", function (value) {
        const parts = value.split(".");
        return parts[0].length === 3;
    })
        .test("containsThreeDots", "Oznaczenie musi zawierać 3 kropki", (value) => {
        const parts = value.split(".");
        return parts.length === 4;
    }),
};
function makeProjectValidationSchema(isEditing) {
    return Yup.object().shape({
        ...commonFields,
    });
}
exports.makeProjectValidationSchema = makeProjectValidationSchema;
