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
exports.makeEntityValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonFields = {
    name: Yup.string()
        .required("Podaj nazwę")
        .min(3, "Nazwa musi mieć co najmniej 3 znaki")
        .max(150, "Nazwa może mieć maksymalnie 150 znaków"),
    address: Yup.string().max(250, "Adres może mieć maksymalnie 250 znaków"),
    taxNumber: Yup.string()
        .nullable()
        .test("len", "Numer podatkowy musi mieć dokładnie 10 lub 13 znaków", (val) => val ? val.length === 10 || val.length === 13 : true),
    www: Yup.string().max(150, "WWW może mieć maksymalnie 150 znaków"),
    email: Yup.string()
        .nullable()
        .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
        message: "Nieprawidłowy format email",
        excludeEmptyString: true,
    })
        .max(80, "Email może mieć maksymalnie 80 znaków"),
    phone: Yup.string().max(25, "Telefon może mieć maksymalnie 25 znaków"),
};
function makeEntityValidationSchema(isEditing) {
    return Yup.object().shape({
        ...commonFields,
    });
}
exports.makeEntityValidationSchema = makeEntityValidationSchema;
