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
exports.makeMilestoneValidationSchema = void 0;
const Yup = __importStar(require("yup"));
function makeMilestoneValidationSchema(isEditing) {
    return Yup.object().shape({
        _type: Yup.object().required("Typ kamienia milowego jest wymagany"),
        name: Yup.string().test("conditional-required", "Nazwa jest wymagana", function (value) {
            const { _type } = this.parent;
            const isUnique = _type?.isUniquePerContract;
            if (!isUnique && !value) {
                return this.createError({ message: "Nazwa jest wymagana, bo kamieni tego typu może być więcej" });
            }
            return true;
        }),
        description: Yup.string().max(300, "Opis może mieć maksymalnie 300 znaków"),
        status: Yup.string().required("Status jest wymagany"),
        startDate: Yup.date()
            .transform((value, originalValue) => (originalValue === "" ? null : value))
            .nullable()
            .typeError("Nieprawidłowy format daty rozpoczęcia")
            .max(Yup.ref("endDate"), "Data rozpoczęcia nie może być późniejsza niż data zakończenia"),
        endDate: Yup.date()
            .transform((value, originalValue) => (originalValue === "" ? null : value))
            .nullable()
            .typeError("Nieprawidłowy format daty zakończenia")
            .min(Yup.ref("startDate"), "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia"),
    });
}
exports.makeMilestoneValidationSchema = makeMilestoneValidationSchema;
