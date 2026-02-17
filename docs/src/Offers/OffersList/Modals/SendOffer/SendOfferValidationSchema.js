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
exports.makeSendAnotherOfferValidationSchema = exports.makeSendOfferValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const _recipients = Yup.array().default([]).min(1, "Wybierz co przynajmniej jednego odbiorcę");
const _gdFilesBasicData = Yup.array().default([]).min(1, "Wybierz co najmniej jeden plik oferty i ew. załączniki");
function makeSendOfferValidationSchema(isEditing) {
    return Yup.object().shape({
        _newEvent: Yup.object().shape({
            comment: Yup.string().max(500, "Uwagi mogą mieć maksymalnie 500 znaków"),
            additionalMessage: Yup.string().max(500, "Uwagi mogą mieć maksymalnie 500 znaków"),
            _recipients,
            _gdFilesBasicData,
        }),
    });
}
exports.makeSendOfferValidationSchema = makeSendOfferValidationSchema;
function makeSendAnotherOfferValidationSchema(isEditing) {
    return Yup.object().shape({
        _newEvent: Yup.object().shape({
            comment: Yup.string()
                .max(500, "Uwagi mogą mieć maksymalnie 500 znaków")
                .required("Komentarz jest wymagany"),
            additionalMessage: Yup.string()
                .max(500, "Uwagi mogą mieć maksymalnie 500 znaków")
                .required("Dodatkowa informacja jest wymagana"),
            _recipients,
            _gdFilesBasicData,
        }),
    });
}
exports.makeSendAnotherOfferValidationSchema = makeSendAnotherOfferValidationSchema;
