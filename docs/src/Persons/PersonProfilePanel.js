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
exports.renderPersonProfilePanelSkillItem = renderPersonProfilePanelSkillItem;
exports.default = PersonProfilePanel;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const personsV2Helpers_1 = require("./personsV2Helpers");
function formatDateRange(dateFrom, dateTo, isCurrent) {
    const fmt = (d) => {
        try {
            return new Date(d).toLocaleDateString("pl-PL", { year: "numeric", month: "short" });
        }
        catch {
            return d;
        }
    };
    const from = dateFrom ? fmt(dateFrom) : "";
    const to = isCurrent ? "obecnie" : dateTo ? fmt(dateTo) : "";
    if (from && to)
        return `${from} - ${to}`;
    if (from)
        return `od ${from}`;
    if (to)
        return `do ${to}`;
    return "";
}
function ProfileHeader({ profile }) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        profile.headline && react_1.default.createElement("h6", { className: "mb-1" }, profile.headline),
        profile.summary && react_1.default.createElement("p", { className: "text-muted small mb-2" }, profile.summary)));
}
function renderPersonProfilePanelSkillItem(skill) {
    return (react_1.default.createElement("div", { key: skill.id, className: "me-2 mb-2" },
        react_1.default.createElement(react_bootstrap_1.Badge, { bg: "secondary", className: "me-1" },
            skill._skill?.name || `Skill #${skill.skillId}`,
            skill.levelCode && react_1.default.createElement("span", { className: "ms-1 opacity-75" },
                "(",
                skill.levelCode,
                ")")),
        skill._skill?.description && react_1.default.createElement("div", { className: "text-muted small mt-1" }, skill._skill.description)));
}
function SkillsList({ skills }) {
    if (!skills || skills.length === 0)
        return null;
    return (react_1.default.createElement("div", { className: "mb-3" },
        react_1.default.createElement("strong", { className: "small" }, "Specjalizacje"),
        react_1.default.createElement("div", { className: "mt-1 d-flex flex-wrap" }, skills.map(renderPersonProfilePanelSkillItem))));
}
function ExperienceList({ experiences }) {
    if (!experiences || experiences.length === 0)
        return null;
    return (react_1.default.createElement("div", { className: "mb-3" },
        react_1.default.createElement("strong", { className: "small" }, "Doswiadczenie"),
        experiences.map((exp) => (react_1.default.createElement("div", { key: exp.id, className: "mt-1 small" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("strong", null, exp.positionName),
                exp.organizationName && react_1.default.createElement("span", { className: "text-muted" },
                    " - ",
                    exp.organizationName)),
            react_1.default.createElement("div", { className: "text-muted" }, formatDateRange(exp.dateFrom, exp.dateTo, exp.isCurrent)),
            exp.description && react_1.default.createElement("div", { className: "mt-1" }, exp.description))))));
}
function EducationList({ educations }) {
    if (!educations || educations.length === 0)
        return null;
    return (react_1.default.createElement("div", { className: "mb-3" },
        react_1.default.createElement("strong", { className: "small" }, "Wyksztalcenie"),
        educations.map((edu) => (react_1.default.createElement("div", { key: edu.id, className: "mt-1 small" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("strong", null, edu.schoolName),
                edu.degreeName && react_1.default.createElement("span", { className: "text-muted" },
                    " - ",
                    edu.degreeName)),
            edu.fieldOfStudy && react_1.default.createElement("div", null, edu.fieldOfStudy),
            react_1.default.createElement("div", { className: "text-muted" }, formatDateRange(edu.dateFrom, edu.dateTo)))))));
}
function PersonProfilePanel({ person, onClose }) {
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [skills, setSkills] = (0, react_1.useState)([]);
    const [experiences, setExperiences] = (0, react_1.useState)([]);
    const [educations, setEducations] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        Promise.all([
            (0, personsV2Helpers_1.fetchPersonProfileV2)(person.id),
            (0, personsV2Helpers_1.fetchPersonProfileSkills)(person.id),
            (0, personsV2Helpers_1.fetchPersonProfileExperiences)(person.id),
            (0, personsV2Helpers_1.fetchPersonProfileEducations)(person.id),
        ])
            .then(([profileResult, skillsResult, experiencesResult, educationsResult]) => {
            if (!cancelled) {
                setProfile(profileResult);
                setSkills(skillsResult);
                setExperiences(experiencesResult);
                setEducations(educationsResult);
                setIsLoading(false);
            }
        })
            .catch((err) => {
            if (!cancelled) {
                setError(err instanceof Error ? err.message : String(err));
                setIsLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [person.id]);
    return (react_1.default.createElement(react_bootstrap_1.Card, { className: "h-100" },
        react_1.default.createElement(react_bootstrap_1.Card.Header, { className: "d-flex justify-content-between align-items-center" },
            react_1.default.createElement("strong", null,
                person.name,
                " ",
                person.surname),
            react_1.default.createElement(react_bootstrap_1.CloseButton, { onClick: onClose })),
        react_1.default.createElement(react_bootstrap_1.Card.Body, { style: { overflowY: "auto" } },
            isLoading && (react_1.default.createElement("div", { className: "text-center py-3" },
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm" }))),
            error && react_1.default.createElement("div", { className: "text-danger small" }, error),
            !isLoading && !error && !profile && react_1.default.createElement("p", { className: "text-muted small" }, "Brak profilu"),
            !isLoading && !error && profile && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(ProfileHeader, { profile: profile }),
                react_1.default.createElement(SkillsList, { skills: skills }),
                react_1.default.createElement(ExperienceList, { experiences: experiences }),
                react_1.default.createElement(EducationList, { educations: educations }),
                react_1.default.createElement("div", { className: "mt-3 text-end" },
                    react_1.default.createElement(react_bootstrap_1.Button, { as: react_router_dom_1.Link, to: `/person/${person.id}`, variant: "outline-primary", size: "sm" }, "Pelny profil ->")))))));
}
