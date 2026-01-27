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
exports.makeCostInvoiceValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const CostInvoicesController_1 = require("../CostInvoicesController");
/**
 * Schema walidacji dla edycji faktury kosztowej
 * Większość pól jest tylko do odczytu (pobrane z KSeF)
 * Edytowalne są tylko pola zarządzania wewnętrznego
 */
function makeCostInvoiceValidationSchema(isEditing) {
    return Yup.object().shape({
        status: Yup.string()
            .required("Status jest wymagany")
            .oneOf(Object.values(CostInvoicesController_1.CostInvoiceStatuses), "Nieprawidłowy status"),
        isCompanyCost: Yup.boolean().required(),
        isPaid: Yup.boolean().required(),
        paidDate: Yup.date().nullable(),
        paymentDeadline: Yup.date().nullable(),
        costCategory: Yup.string().nullable(),
        comment: Yup.string()
            .max(1000, "Komentarz może mieć maksymalnie 1000 znaków")
            .nullable(),
        _contract: Yup.object().nullable(),
    });
}
exports.makeCostInvoiceValidationSchema = makeCostInvoiceValidationSchema;
