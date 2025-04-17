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
exports.ProjectRoleAddNewModalButton = exports.ContractRoleAddNewModalButton = exports.ContractRoleEditModalButton = exports.ProjectRoleEditModalButton = exports.RoleEditModalButton = void 0;
const react_1 = __importStar(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const RolesController_1 = require("../RolesController");
const ProjectRoleModal_1 = require("./ProjectRoleModal");
const ContractRoleModalBody_1 = require("./ContractRoleModalBody");
const RoleValidationSchema_1 = require("./RoleValidationSchema");
function RoleEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    (0, react_1.useEffect)(() => { }, [initialData]);
    return (0, RolesController_1.isProjectRole)(initialData) ? (react_1.default.createElement(ProjectRoleEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps })) : (react_1.default.createElement(ContractRoleEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps }));
}
exports.RoleEditModalButton = RoleEditModalButton;
function ProjectRoleEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: ProjectRoleModal_1.ProjectRoleModalBody,
            modalTitle: "Edycja roli projektowej",
            repository: RolesController_1.rolesRepository,
            initialData: initialData,
            makeValidationSchema: RoleValidationSchema_1.makeProjectRoleValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.ProjectRoleEditModalButton = ProjectRoleEditModalButton;
function ContractRoleEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: ContractRoleModalBody_1.ContractRoleModalBody,
            modalTitle: "Edycja roli kontraktowej",
            repository: RolesController_1.rolesRepository,
            initialData: initialData,
            makeValidationSchema: RoleValidationSchema_1.makeContractRoleValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.ContractRoleEditModalButton = ContractRoleEditModalButton;
function ContractRoleAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractRoleModalBody_1.ContractRoleModalBody,
            modalTitle: "Dodaj rolę kontraktową",
            modalSubtitle: "Dodana rola będzie przypisana <strong>tylko do wybranego kontraktu</strong>. Jeśli chcesz dodać rolę do wszystkich kontraktów w projekcie, " +
                "skorzystaj z opcji dodaj rolę projektową",
            repository: RolesController_1.rolesRepository,
            makeValidationSchema: RoleValidationSchema_1.makeContractRoleValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj rolę kontraktową",
        } }));
}
exports.ContractRoleAddNewModalButton = ContractRoleAddNewModalButton;
function ProjectRoleAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ProjectRoleModal_1.ProjectRoleModalBody,
            modalTitle: "Dodaj rolę projektową",
            modalSubtitle: "Dodana rola będzie przypisana <strong>do wszystkich kontraktów w wybranym projekcie</strong>. Jeśi chcesz dodac rolę do jednego kontraktu," +
                "skorzystaj z opcji dodaj rola kontraktowa",
            repository: RolesController_1.rolesRepository,
            makeValidationSchema: RoleValidationSchema_1.makeProjectRoleValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj rolę projektową",
            buttonVariant: "outline-success",
        } }));
}
exports.ProjectRoleAddNewModalButton = ProjectRoleAddNewModalButton;
