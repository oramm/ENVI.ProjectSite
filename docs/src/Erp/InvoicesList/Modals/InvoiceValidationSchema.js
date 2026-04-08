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
exports.makeInvoiceValidationSchema = makeInvoiceValidationSchema;
exports.makeInvoiceIssueValidationSchema = makeInvoiceIssueValidationSchema;
exports.makeInvoiceSetAsSentValidationSchema = makeInvoiceSetAsSentValidationSchema;
const Yup = __importStar(require("yup"));
const commonFields = {
    _contract: Yup.object()
        .required('Wybierz kontrakt'),
    issueDate: Yup.date()
        .required('Data wystawienia jest wymagana'),
    _entity: Yup.object()
        .required('Wybierz podmiot'),
    daysToPay: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Liczba musi być większa lub równa 0')
        .max(60, 'Liczba musi być mniejsza lub równa 60'),
    status: Yup.string()
        .required('Status jest wymagany'),
    _owner: Yup.object()
        .required('Podaj kto rejestruje'),
    description: Yup.string()
        .max(500, 'Opis może mieć maksymalnie 500 znaków'),
    isJstSubordinate: Yup.boolean(),
    isGvMember: Yup.boolean(),
    includeThirdParty: Yup.boolean().when(['isJstSubordinate', 'isGvMember'], {
        is: (isJstSubordinate, isGvMember) => Boolean(isJstSubordinate) || Boolean(isGvMember),
        then: (schema) => schema.oneOf([true], 'Podmiot 3 jest wymagany dla JST/GV'),
        otherwise: (schema) => schema,
    }),
    addAnotherThirdParty: Yup.boolean(),
    _thirdParties: Yup.array()
        .of(Yup.object().shape({
        _entity: Yup.object().required('Wybierz podmiot 3'),
        role: Yup.number()
            .nullable()
            .typeError('Wybierz rolę podmiotu 3')
            .required('Wybierz rolę podmiotu 3')
            .integer('Rola musi być liczbą całkowitą')
            .min(1, 'Rola musi być w zakresie 1-10')
            .max(10, 'Rola musi być w zakresie 1-10'),
    }))
        .when('includeThirdParty', {
        is: true,
        then: (schema) => schema.min(1, 'Dodaj co najmniej jeden Podmiot 3'),
        otherwise: (schema) => schema.max(0),
    })
        .test('jst-role-8', 'Dla JST wymagany jest Podmiot 3 z rolą 8', function (value) {
        if (!this.parent.isJstSubordinate)
            return true;
        return Boolean((value || []).some((item) => Number(item?.role) === 8));
    })
        .test('gv-role-10', 'Dla GV wymagany jest Podmiot 3 z rolą 10', function (value) {
        if (!this.parent.isGvMember)
            return true;
        return Boolean((value || []).some((item) => Number(item?.role) === 10));
    }),
};
function makeInvoiceValidationSchema(isEditing) {
    return (Yup.object().shape({
        ...commonFields,
    }));
}
function makeInvoiceIssueValidationSchema() {
    return (Yup.object().shape({
        number: Yup.string()
            .min(6, 'Numer musi mieć co najmniej 6 znaków')
            .max(9, 'Numer może mieć maksymalnie 9 znaków'),
    }));
}
function makeInvoiceSetAsSentValidationSchema() {
    return (Yup.object().shape({
        sentDate: Yup.date()
            .required('Data nadania jest wymagana'),
    }));
}
