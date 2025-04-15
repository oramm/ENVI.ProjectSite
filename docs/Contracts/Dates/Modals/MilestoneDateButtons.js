"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneDateEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const MilestoneDateModalBody_1 = require("./MilestoneDateModalBody");
const MilestoneDatesController_1 = require("../MilestoneDatesController");
const MilestoneDateValidationSchema_1 = require("./MilestoneDateValidationSchema");
function MilestoneDateEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit,
            ModalBodyComponent: MilestoneDateModalBody_1.MilestoneDateModalBody,
            modalTitle: "Edycja daty kamienia milowego",
            repository: MilestoneDatesController_1.milestoneDatesRepository,
            initialData,
            makeValidationSchema: MilestoneDateValidationSchema_1.makeMilestoneDateValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-primary",
        } }));
}
exports.MilestoneDateEditModalButton = MilestoneDateEditModalButton;
