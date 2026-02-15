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
exports.default = PersonProfilePage;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const personsV2Helpers_1 = require("../personsV2Helpers");
const EducationController_1 = require("./Education/EducationController");
const EducationModalButtons_1 = require("./Education/EducationModalButtons");
const ExperienceController_1 = require("./Experience/ExperienceController");
const ExperienceModalButtons_1 = require("./Experience/ExperienceModalButtons");
const ProfileSkillsController_1 = require("./ProfileSkills/ProfileSkillsController");
const ProfileSkillModalButtons_1 = require("./ProfileSkills/ProfileSkillModalButtons");
function PersonProfileHeader({ personId }) {
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        setIsLoading(true);
        (0, personsV2Helpers_1.fetchPersonProfileV2Full)(personId)
            .then((result) => {
            if (!cancelled)
                setProfile(result);
        })
            .finally(() => {
            if (!cancelled)
                setIsLoading(false);
        });
        return () => { cancelled = true; };
    }, [personId]);
    if (isLoading) {
        return (react_1.default.createElement("div", { className: "text-center py-3" },
            react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm" })));
    }
    if (!profile) {
        return react_1.default.createElement("p", { className: "text-muted" },
            "Brak profilu dla osoby #",
            personId);
    }
    return (react_1.default.createElement("div", { className: "mb-4" },
        profile.headline && react_1.default.createElement("h4", { className: "mb-1" }, profile.headline),
        profile.summary && react_1.default.createElement("p", { className: "text-muted" }, profile.summary)));
}
function PersonProfilePage() {
    const { id } = (0, react_router_dom_1.useParams)();
    const personId = parseInt(id);
    (0, react_1.useEffect)(() => {
        document.title = `Profil osoby #${personId}`;
    }, [personId]);
    const educationsRepo = (0, react_1.useMemo)(() => (0, EducationController_1.createEducationsRepository)(personId), [personId]);
    const experienceRepo = (0, react_1.useMemo)(() => (0, ExperienceController_1.createExperienceRepository)(personId), [personId]);
    const skillsRepo = (0, react_1.useMemo)(() => (0, ProfileSkillsController_1.createProfileSkillsRepository)(personId), [personId]);
    const EducationAddButton = (0, react_1.useMemo)(() => (0, EducationModalButtons_1.createEducationAddNewModalButton)(educationsRepo), [educationsRepo]);
    const EducationEditButton = (0, react_1.useMemo)(() => (0, EducationModalButtons_1.createEducationEditModalButton)(educationsRepo), [educationsRepo]);
    const ExperienceAddButton = (0, react_1.useMemo)(() => (0, ExperienceModalButtons_1.createExperienceAddNewModalButton)(experienceRepo), [experienceRepo]);
    const ExperienceEditButton = (0, react_1.useMemo)(() => (0, ExperienceModalButtons_1.createExperienceEditModalButton)(experienceRepo), [experienceRepo]);
    const SkillAddButton = (0, react_1.useMemo)(() => (0, ProfileSkillModalButtons_1.createProfileSkillAddNewModalButton)(skillsRepo), [skillsRepo]);
    const SkillEditButton = (0, react_1.useMemo)(() => (0, ProfileSkillModalButtons_1.createProfileSkillEditModalButton)(skillsRepo), [skillsRepo]);
    function renderSkillName(skill) {
        return react_1.default.createElement(react_1.default.Fragment, null, skill._skill?.name || `Skill #${skill.skillId}`);
    }
    function renderSkillLevel(skill) {
        return react_1.default.createElement(react_1.default.Fragment, null, skill.levelCode || "-");
    }
    function renderSkillYears(skill) {
        return react_1.default.createElement(react_1.default.Fragment, null, skill.yearsOfExperience != null ? `${skill.yearsOfExperience}` : "-");
    }
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement(PersonProfileHeader, { personId: personId }),
        react_1.default.createElement("h5", null, "Specjalizacje"),
        react_1.default.createElement(FilterableTable_1.default, { id: `person_${personId}_skills`, repository: skillsRepo, tableStructure: [
                { header: "Specjalizacja", renderTdBody: renderSkillName },
                { header: "Poziom", renderTdBody: renderSkillLevel },
                { header: "Lata doświadczenia", renderTdBody: renderSkillYears },
            ], AddNewButtonComponents: [SkillAddButton], EditButtonComponent: SkillEditButton, isDeletable: true }),
        react_1.default.createElement("h5", { className: "mt-4" }, "Wykszta\u0142cenie"),
        react_1.default.createElement(FilterableTable_1.default, { id: `person_${personId}_educations`, repository: educationsRepo, tableStructure: [
                { header: "Szkoła/Uczelnia", objectAttributeToShow: "schoolName" },
                { header: "Tytuł/Stopień", objectAttributeToShow: "degreeName" },
                { header: "Kierunek", objectAttributeToShow: "fieldOfStudy" },
                { header: "Od", objectAttributeToShow: "dateFrom" },
                { header: "Do", objectAttributeToShow: "dateTo" },
            ], AddNewButtonComponents: [EducationAddButton], EditButtonComponent: EducationEditButton, isDeletable: true }),
        react_1.default.createElement("h5", { className: "mt-4" }, "Do\u015Bwiadczenie"),
        react_1.default.createElement(FilterableTable_1.default, { id: `person_${personId}_experiences`, repository: experienceRepo, tableStructure: [
                { header: "Organizacja", objectAttributeToShow: "organizationName" },
                { header: "Stanowisko", objectAttributeToShow: "positionName" },
                { header: "Od", objectAttributeToShow: "dateFrom" },
                { header: "Do", objectAttributeToShow: "dateTo" },
            ], AddNewButtonComponents: [ExperienceAddButton], EditButtonComponent: ExperienceEditButton, isDeletable: true })));
}
