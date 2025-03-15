"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRoleAddNewModalButton = exports.ContractRoleAddNewModalButton = exports.RoleEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const RolesController_1 = require("../RolesController");
const RoleModalBody_1 = require("./RoleModalBody");
const RoleValidationSchema_1 = require("./RoleValidationSchema");
const ContractRoleModal_1 = require("./ContractRoleModal");
const ProjectRoleModal_1 = require("./ProjectRoleModal");
function RoleEditModalButton({ modalProps: { onEdit, initialData } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: RoleModalBody_1.RoleModalBody,
            modalTitle: "Edycja roli",
            repository: RolesController_1.rolesRepository,
            initialData: initialData,
            makeValidationSchema: RoleValidationSchema_1.makeRoleValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.RoleEditModalButton = RoleEditModalButton;
function ContractRoleAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractRoleModal_1.ContractRoleModalBody,
            modalTitle: "Dodaj rolę kontraktową",
            modalSubtitle: "Dodana rola będzie przypisana do wybranego kontraktu. Jeśli chcesz dodać rolę do wszystkich kontraktów w projekcie," +
                "skorzystaj z opcji dodaj rolę projektową",
            repository: RolesController_1.rolesRepository,
            makeValidationSchema: RoleValidationSchema_1.makeRoleValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj rolę kontraktową",
            buttonVariant: "outline-success",
        } }));
}
exports.ContractRoleAddNewModalButton = ContractRoleAddNewModalButton;
function ProjectRoleAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ProjectRoleModal_1.ProjectRoleModalBody,
            modalTitle: "Dodaj rolę projektową",
            modalSubtitle: "Dodana rola będzie przypisana do wszystkich kontraktów w wybranym projekcie. Jeśi chcesz dodac rolę do jednego kontraktu," +
                "skorzystaj z opcji dodaj rola kontraktowa",
            repository: RolesController_1.rolesRepository,
            makeValidationSchema: RoleValidationSchema_1.makeRoleValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj rolę projektową",
            buttonVariant: "outline-success",
        } }));
}
exports.ProjectRoleAddNewModalButton = ProjectRoleAddNewModalButton;
