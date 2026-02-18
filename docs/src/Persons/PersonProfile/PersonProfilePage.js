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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPersonProfileSkillNameCell = renderPersonProfileSkillNameCell;
exports.default = PersonProfilePage;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const ToolsDate_1 = __importDefault(require("../../React/Tools/ToolsDate"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const personsV2Helpers_1 = require("../personsV2Helpers");
const EducationController_1 = require("./Education/EducationController");
const EducationModalButtons_1 = require("./Education/EducationModalButtons");
const ExperienceController_1 = require("./Experience/ExperienceController");
const ExperienceModalButtons_1 = require("./Experience/ExperienceModalButtons");
const ProfileSkillsController_1 = require("./ProfileSkills/ProfileSkillsController");
const ProfileSkillModalButtons_1 = require("./ProfileSkills/ProfileSkillModalButtons");
const ProfileImportModal_1 = __importDefault(require("./Import/ProfileImportModal"));
function renderPersonProfileSkillNameCell(skill) {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", null, skill._skill?.name || `Skill #${skill.skillId}`),
        skill._skill?.description && react_1.default.createElement("div", { className: "text-muted small" }, skill._skill.description)));
}
function PersonProfilePage() {
    const { id } = (0, react_router_dom_1.useParams)();
    const personId = parseInt(id || "0");
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [profileLoading, setProfileLoading] = (0, react_1.useState)(true);
    const [skills, setSkills] = (0, react_1.useState)(undefined);
    const [educations, setEducations] = (0, react_1.useState)(undefined);
    const [experiences, setExperiences] = (0, react_1.useState)(undefined);
    const educationsRepo = (0, react_1.useMemo)(() => (0, EducationController_1.createEducationsRepository)(personId), [personId]);
    const experienceRepo = (0, react_1.useMemo)(() => (0, ExperienceController_1.createExperienceRepository)(personId), [personId]);
    const skillsRepo = (0, react_1.useMemo)(() => (0, ProfileSkillsController_1.createProfileSkillsRepository)(personId), [personId]);
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        setProfileLoading(true);
        (0, personsV2Helpers_1.fetchPersonProfileV2)(personId)
            .then((result) => {
            if (!cancelled)
                setProfile(result);
        })
            .finally(() => {
            if (!cancelled)
                setProfileLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [personId]);
    (0, react_1.useEffect)(() => {
        async function fetchSkills() {
            await skillsRepo.loadItemsFromServerPOST([]);
            setSkills([...skillsRepo.items]);
        }
        fetchSkills();
    }, [skillsRepo]);
    (0, react_1.useEffect)(() => {
        async function fetchEducations() {
            await educationsRepo.loadItemsFromServerPOST([]);
            setEducations([...educationsRepo.items]);
        }
        fetchEducations();
    }, [educationsRepo]);
    (0, react_1.useEffect)(() => {
        async function fetchExperiences() {
            await experienceRepo.loadItemsFromServerPOST([]);
            setExperiences([...experienceRepo.items]);
        }
        fetchExperiences();
    }, [experienceRepo]);
    (0, react_1.useEffect)(() => {
        document.title = `Profil osoby #${personId}`;
    }, [personId]);
    const [showImportModal, setShowImportModal] = (0, react_1.useState)(false);
    const handleImportDone = (0, react_1.useCallback)(async () => {
        await Promise.all([
            skillsRepo.loadItemsFromServerPOST([]),
            educationsRepo.loadItemsFromServerPOST([]),
            experienceRepo.loadItemsFromServerPOST([]),
        ]);
        setSkills([...skillsRepo.items]);
        setEducations([...educationsRepo.items]);
        setExperiences([...experienceRepo.items]);
    }, [skillsRepo, educationsRepo, experienceRepo]);
    const EducationAddButton = (0, react_1.useMemo)(() => (0, EducationModalButtons_1.createEducationAddNewModalButton)(educationsRepo), [educationsRepo]);
    const EducationEditButton = (0, react_1.useMemo)(() => (0, EducationModalButtons_1.createEducationEditModalButton)(educationsRepo), [educationsRepo]);
    const ExperienceAddButton = (0, react_1.useMemo)(() => (0, ExperienceModalButtons_1.createExperienceAddNewModalButton)(experienceRepo), [experienceRepo]);
    const ExperienceEditButton = (0, react_1.useMemo)(() => (0, ExperienceModalButtons_1.createExperienceEditModalButton)(experienceRepo), [experienceRepo]);
    const SkillAddButton = (0, react_1.useMemo)(() => (0, ProfileSkillModalButtons_1.createProfileSkillAddNewModalButton)(skillsRepo), [skillsRepo]);
    const SkillEditButton = (0, react_1.useMemo)(() => (0, ProfileSkillModalButtons_1.createProfileSkillEditModalButton)(skillsRepo), [skillsRepo]);
    function renderSkillLevel(skill) {
        return react_1.default.createElement(react_1.default.Fragment, null, skill.levelCode || "-");
    }
    function renderSkillYears(skill) {
        return react_1.default.createElement(react_1.default.Fragment, null, skill.yearsOfExperience != null ? `${skill.yearsOfExperience}` : "-");
    }
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement("div", { className: "d-flex justify-content-end mb-3" },
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", onClick: () => setShowImportModal(true) }, "Importuj z CV")),
        react_1.default.createElement(ProfileImportModal_1.default, { personId: personId, show: showImportModal, onHide: () => setShowImportModal(false), onImportDone: handleImportDone }),
        profileLoading ? (react_1.default.createElement("div", { className: "text-center py-3" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))) : profile ? (react_1.default.createElement("div", { className: "mb-4" },
            profile.headline && react_1.default.createElement("h4", { className: "mb-1" }, profile.headline),
            profile.summary && react_1.default.createElement("p", { className: "text-muted" }, profile.summary))) : (react_1.default.createElement("p", { className: "text-muted" },
            "Brak profilu dla osoby #",
            personId)),
        react_1.default.createElement("h5", null, "Specjalizacje"),
        skills ? (react_1.default.createElement(FilterableTable_1.default, { id: `person_${personId}_skills`, repository: skillsRepo, initialObjects: skills, tableStructure: [
                { header: "Specjalizacja", renderTdBody: renderPersonProfileSkillNameCell, colMd: 6 },
                { header: "Poziom", renderTdBody: renderSkillLevel, colMd: 3 },
                { header: "Lata doswiadczenia", renderTdBody: renderSkillYears, colMd: 3 },
            ], AddNewButtonComponents: [SkillAddButton], EditButtonComponent: SkillEditButton, isDeletable: true, showTableHeader: false })) : (react_1.default.createElement("div", { className: "text-center py-3" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))),
        react_1.default.createElement("h5", { className: "mt-4" }, "Wyksztalcenie"),
        educations ? (react_1.default.createElement(FilterableTable_1.default, { id: `person_${personId}_educations`, repository: educationsRepo, initialObjects: educations, tableStructure: [
                { header: "Szkola/Uczelnia", objectAttributeToShow: "schoolName", colMd: 3 },
                { header: "Tytul/Stopien", objectAttributeToShow: "degreeName", colMd: 3 },
                { header: "Kierunek", objectAttributeToShow: "fieldOfStudy", colMd: 3 },
                {
                    header: "Od",
                    renderTdBody: (e) => (react_1.default.createElement(react_1.default.Fragment, null, e.dateFrom ? ToolsDate_1.default.dateISOToDMY(e.dateFrom) : "-")),
                    colMd: 1,
                },
                {
                    header: "Do",
                    renderTdBody: (e) => (react_1.default.createElement(react_1.default.Fragment, null, e.dateTo ? ToolsDate_1.default.dateISOToDMY(e.dateTo) : "-")),
                    colMd: 1,
                },
            ], AddNewButtonComponents: [EducationAddButton], EditButtonComponent: EducationEditButton, isDeletable: true, showTableHeader: false })) : (react_1.default.createElement("div", { className: "text-center py-3" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))),
        react_1.default.createElement("h5", { className: "mt-4" }, "Doswiadczenie"),
        experiences ? (react_1.default.createElement(FilterableTable_1.default, { id: `person_${personId}_experiences`, repository: experienceRepo, initialObjects: experiences, tableStructure: [
                { header: "Organizacja", objectAttributeToShow: "organizationName", colMd: 4 },
                { header: "Stanowisko", objectAttributeToShow: "positionName", colMd: 4 },
                {
                    header: "Od",
                    renderTdBody: (e) => (react_1.default.createElement(react_1.default.Fragment, null, e.dateFrom ? ToolsDate_1.default.dateISOToDMY(e.dateFrom) : "-")),
                    colMd: 2,
                },
                {
                    header: "Do",
                    renderTdBody: (e) => (react_1.default.createElement(react_1.default.Fragment, null, e.dateTo ? ToolsDate_1.default.dateISOToDMY(e.dateTo) : "-")),
                    colMd: 2,
                },
            ], AddNewButtonComponents: [ExperienceAddButton], EditButtonComponent: ExperienceEditButton, isDeletable: true, showTableHeader: false })) : (react_1.default.createElement("div", { className: "text-center py-3" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)))));
}
