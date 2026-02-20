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
const personPublicProfileSubmissionReviewApi_1 = require("./PublicProfileSubmission/personPublicProfileSubmissionReviewApi");
function derivePublicSubmissionProcessUiState(submissions) {
    if (submissions.length === 0)
        return "PRE_START";
    if (submissions.some(s => s.status === "SUBMITTED"))
        return "SUBMITTED";
    if (submissions.some(s => s.status === "DRAFT"))
        return "ACTIVE";
    if (submissions.every(s => s.status === "CLOSED"))
        return "CLOSED";
    return "PRE_START";
}
function mapPublicSubmissionStateToBadgeVariant(state) {
    if (state === "SUBMITTED")
        return "success";
    if (state === "CLOSED")
        return "secondary";
    if (state === "ACTIVE")
        return "primary";
    return "secondary";
}
function mapPublicSubmissionStateToLabel(state) {
    if (state === "SUBMITTED")
        return "Wyslane";
    if (state === "CLOSED")
        return "Zamkniete";
    if (state === "ACTIVE")
        return "Aktywne";
    return "Nie zainicjowano";
}
function itemTypeBadgeVariant(itemType) {
    if (itemType === "EXPERIENCE")
        return "primary";
    if (itemType === "EDUCATION")
        return "info";
    return "secondary";
}
function itemStatusBadgeVariant(itemStatus) {
    if (itemStatus === "PENDING")
        return "warning";
    if (itemStatus === "ACCEPTED")
        return "success";
    return "danger";
}
function itemStatusLabel(itemStatus) {
    if (itemStatus === "PENDING")
        return "Oczekuje";
    if (itemStatus === "ACCEPTED")
        return "Zaakceptowany";
    return "Odrzucony";
}
function renderItemPayloadSummary(item) {
    const p = item.payload || {};
    if (item.itemType === "EXPERIENCE") {
        return [p.organizationName, p.positionName].filter(Boolean).join(" — ") || "Doswiadczenie";
    }
    if (item.itemType === "EDUCATION") {
        return [p.schoolName, p.degreeName, p.fieldOfStudy].filter(Boolean).join(" — ") || "Wyksztalcenie";
    }
    return [p.name, p.levelCode].filter(Boolean).join(" — ") || "Umiejetnosc";
}
function linkEventTypeLabel(eventType) {
    if (eventType === "LINK_SENT")
        return "Wyslano";
    if (eventType === "LINK_SEND_FAILED")
        return "Blad wysylki";
    return "Wygenerowano";
}
function dispatchAlertVariant(status) {
    if (status === "LINK_SENT")
        return "success";
    if (status === "LINK_SEND_FAILED")
        return "warning";
    return "info";
}
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
    const [submissions, setSubmissions] = (0, react_1.useState)([]);
    const [activeSubmission, setActiveSubmission] = (0, react_1.useState)(null);
    const [publicReviewLoading, setPublicReviewLoading] = (0, react_1.useState)(true);
    const [publicReviewError, setPublicReviewError] = (0, react_1.useState)(null);
    const [publicSubmissionInitLoading, setPublicSubmissionInitLoading] = (0, react_1.useState)(false);
    const [publicSubmissionInitError, setPublicSubmissionInitError] = (0, react_1.useState)(null);
    const [createdLinkUrl, setCreatedLinkUrl] = (0, react_1.useState)(null);
    const [linkRecipientEmail, setLinkRecipientEmail] = (0, react_1.useState)("");
    const [linkSendNow, setLinkSendNow] = (0, react_1.useState)(false);
    const [linkDispatch, setLinkDispatch] = (0, react_1.useState)(null);
    const [reviewingItemId, setReviewingItemId] = (0, react_1.useState)(null);
    const [tableExternalUpdate, setTableExternalUpdate] = (0, react_1.useState)(0);
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
    const loadSubmissions = (0, react_1.useCallback)(async () => {
        setPublicReviewLoading(true);
        setPublicReviewError(null);
        try {
            const results = await (0, personPublicProfileSubmissionReviewApi_1.searchSubmissions)(personId);
            setSubmissions(results);
            // Auto-load details for the most recent SUBMITTED submission
            const submitted = results.find(s => s.status === "SUBMITTED");
            if (submitted) {
                const details = await (0, personPublicProfileSubmissionReviewApi_1.getSubmissionDetails)(personId, submitted.id);
                setActiveSubmission(details);
            }
            else {
                setActiveSubmission(null);
            }
        }
        catch (error) {
            if ((0, personPublicProfileSubmissionReviewApi_1.isPersonPublicProfileSubmissionOfficeApiError)(error)) {
                setPublicReviewError(`Nie udalo sie pobrac stanu procesu: ${error.message}`);
            }
            else {
                setPublicReviewError("Nie udalo sie pobrac stanu procesu aktualizacji doswiadczenia.");
            }
            setSubmissions([]);
            setActiveSubmission(null);
        }
        finally {
            setPublicReviewLoading(false);
        }
    }, [personId]);
    (0, react_1.useEffect)(() => {
        loadSubmissions();
    }, [loadSubmissions]);
    (0, react_1.useEffect)(() => {
        document.title = `Profil osoby #${personId}`;
    }, [personId]);
    const [showImportModal, setShowImportModal] = (0, react_1.useState)(false);
    const processState = derivePublicSubmissionProcessUiState(submissions);
    const latestSubmissionLinkMeta = (0, react_1.useMemo)(() => {
        if (submissions.length === 0)
            return null;
        return submissions[0] || null;
    }, [submissions]);
    const handleCreateLink = (0, react_1.useCallback)(async () => {
        setPublicSubmissionInitError(null);
        setPublicSubmissionInitLoading(true);
        setCreatedLinkUrl(null);
        setLinkDispatch(null);
        try {
            const normalizedRecipientEmail = linkRecipientEmail.trim();
            const linkResponse = await (0, personPublicProfileSubmissionReviewApi_1.createSubmissionLink)(personId, {
                recipientEmail: normalizedRecipientEmail ? normalizedRecipientEmail : undefined,
                sendNow: linkSendNow,
            });
            setCreatedLinkUrl(linkResponse.copyLink?.url || null);
            setLinkDispatch(linkResponse.lastDispatch || null);
            await loadSubmissions();
        }
        catch (error) {
            if ((0, personPublicProfileSubmissionReviewApi_1.isPersonPublicProfileSubmissionOfficeApiError)(error)) {
                setPublicSubmissionInitError(`Nie udalo sie wygenerowac linku: ${error.message}`);
            }
            else {
                setPublicSubmissionInitError("Nie udalo sie wygenerowac linku aktualizacji doswiadczenia.");
            }
        }
        finally {
            setPublicSubmissionInitLoading(false);
        }
    }, [linkRecipientEmail, linkSendNow, loadSubmissions, personId]);
    const handleReviewItem = (0, react_1.useCallback)(async (itemId, decision) => {
        if (!activeSubmission)
            return;
        const rejectComment = decision === "REJECT"
            ? (window.prompt("Podaj komentarz dla odrzucenia (wymagany):", "") || "").trim()
            : undefined;
        if (decision === "REJECT" && !rejectComment) {
            setPublicReviewError("Komentarz jest wymagany dla decyzji Odrzuc.");
            return;
        }
        setReviewingItemId(itemId);
        try {
            const result = await (0, personPublicProfileSubmissionReviewApi_1.reviewItem)(personId, activeSubmission.id, itemId, decision, rejectComment);
            if (result.autoClosed) {
                // Submission closed — reload full list, clear review panel
                await loadSubmissions();
            }
            else {
                // Reload only the details of the current submission
                const details = await (0, personPublicProfileSubmissionReviewApi_1.getSubmissionDetails)(personId, activeSubmission.id);
                setActiveSubmission(details);
            }
            // On ACCEPT the item was saved to the person's profile — refresh tables
            if (decision === "ACCEPT") {
                await Promise.all([
                    skillsRepo.loadItemsFromServerPOST([]),
                    educationsRepo.loadItemsFromServerPOST([]),
                    experienceRepo.loadItemsFromServerPOST([]),
                ]);
                setSkills([...skillsRepo.items]);
                setEducations([...educationsRepo.items]);
                setExperiences([...experienceRepo.items]);
                setTableExternalUpdate(prev => prev + 1);
            }
        }
        catch (error) {
            if ((0, personPublicProfileSubmissionReviewApi_1.isPersonPublicProfileSubmissionOfficeApiError)(error)) {
                if (error.domainCode === "ITEM_ALREADY_RESOLVED") {
                    // Another reviewer already decided — silently refresh
                    const details = await (0, personPublicProfileSubmissionReviewApi_1.getSubmissionDetails)(personId, activeSubmission.id);
                    setActiveSubmission(details);
                }
                else {
                    setPublicReviewError(`Blad recenzji: ${error.domainCode}`);
                }
            }
            else {
                setPublicReviewError("Nie udalo sie wykonac recenzji.");
            }
        }
        finally {
            setReviewingItemId(null);
        }
    }, [activeSubmission, personId, loadSubmissions, skillsRepo, educationsRepo, experienceRepo]);
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
        react_1.default.createElement(react_bootstrap_1.Card, { className: "mb-4" },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center mb-2" },
                    react_1.default.createElement("h5", { className: "mb-0" }, "Aktualizacja doswiadczenia"),
                    react_1.default.createElement("div", { className: "d-flex gap-2" },
                        processState !== "SUBMITTED" && (react_1.default.createElement(react_bootstrap_1.Button, { variant: processState === "CLOSED" ? "outline-primary" : "primary", size: "sm", onClick: handleCreateLink, disabled: publicSubmissionInitLoading }, publicSubmissionInitLoading
                            ? "Generowanie..."
                            : processState === "CLOSED"
                                ? "Wygeneruj nowy link"
                                : processState === "PRE_START"
                                    ? "Inicjuj proces"
                                    : "Wygeneruj / wyslij ponownie")),
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", size: "sm", onClick: loadSubmissions, disabled: publicReviewLoading }, "Odswiez"))),
                processState !== "SUBMITTED" && (react_1.default.createElement("div", { className: "mb-2" },
                    react_1.default.createElement("div", { className: "row g-2 align-items-end" },
                        react_1.default.createElement("div", { className: "col-md-7" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, { className: "small text-muted mb-1" }, "Email odbiorcy (opcjonalnie)"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { size: "sm", type: "email", placeholder: "user@example.com", value: linkRecipientEmail, onChange: (e) => setLinkRecipientEmail(e.target.value), disabled: publicSubmissionInitLoading })),
                        react_1.default.createElement("div", { className: "col-md-5" },
                            react_1.default.createElement(react_bootstrap_1.Form.Check, { id: "send-now-check", className: "mt-4", type: "checkbox", label: "Wyslij email od razu (sendNow)", checked: linkSendNow, onChange: (e) => setLinkSendNow(e.currentTarget.checked), disabled: publicSubmissionInitLoading }))))),
                publicReviewError && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "warning", className: "mb-2", dismissible: true, onClose: () => setPublicReviewError(null) }, publicReviewError)),
                publicSubmissionInitError && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", className: "mb-2", dismissible: true, onClose: () => setPublicSubmissionInitError(null) }, publicSubmissionInitError)),
                publicReviewLoading ? (react_1.default.createElement("div", { className: "text-muted small" }, "Ladowanie stanu procesu...")) : (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("div", { className: "mb-2" },
                        react_1.default.createElement(react_bootstrap_1.Badge, { bg: mapPublicSubmissionStateToBadgeVariant(processState) }, mapPublicSubmissionStateToLabel(processState)),
                        submissions.length > 0 && react_1.default.createElement("span", { className: "text-muted small ms-2" }, "(aktywny proces)")),
                    processState === "PRE_START" && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "secondary", className: "mb-0" }, "Proces aktualizacji doswiadczenia nie zostal jeszcze zainicjowany. Uzyj przycisku \"Inicjuj proces\", aby wygenerowac link i token dla kandydata.")),
                    createdLinkUrl && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info", className: "mt-2", dismissible: true, onClose: () => setCreatedLinkUrl(null) },
                        react_1.default.createElement("div", { className: "fw-bold mb-1" }, "Link wygenerowany:"),
                        react_1.default.createElement("a", { href: createdLinkUrl, target: "_blank", rel: "noreferrer", className: "text-break" }, createdLinkUrl))),
                    linkDispatch && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: dispatchAlertVariant(linkDispatch.status), className: "mt-2", dismissible: true, onClose: () => setLinkDispatch(null) },
                        react_1.default.createElement("div", { className: "fw-bold mb-1" }, "Wynik akcji linkowej"),
                        react_1.default.createElement("div", null,
                            "Status dispatch: ",
                            linkDispatch.status),
                        linkDispatch.recipientEmail && react_1.default.createElement("div", null,
                            "Odbiorca: ",
                            linkDispatch.recipientEmail),
                        linkDispatch.eventAt && react_1.default.createElement("div", null,
                            "Czas zdarzenia: ",
                            linkDispatch.eventAt))),
                    processState === "ACTIVE" && (react_1.default.createElement("div", { className: "small text-muted mt-2" }, "Kolejny krok: kandydat wypelnia publiczny formularz i wysyla profil do recenzji.")),
                    processState === "CLOSED" && submissions.length > 0 && (react_1.default.createElement("div", { className: "small text-muted mt-2" }, "Proces zamkniety. Mozesz wygenerowac nowy link.")),
                    latestSubmissionLinkMeta && (react_1.default.createElement(react_bootstrap_1.Card, { className: "mt-2" },
                        react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "py-2" },
                            react_1.default.createElement("div", { className: "small fw-bold mb-1" }, "Stan ostatniej wysylki i linku"),
                            latestSubmissionLinkMeta.copyLink?.url && (react_1.default.createElement("div", { className: "small" },
                                "copyLink: ",
                                latestSubmissionLinkMeta.copyLink.url)),
                            latestSubmissionLinkMeta.copyLink?.expiresAt && (react_1.default.createElement("div", { className: "small" },
                                "expiresAt: ",
                                latestSubmissionLinkMeta.copyLink.expiresAt)),
                            latestSubmissionLinkMeta.lastDispatch?.recipientEmail && (react_1.default.createElement("div", { className: "small" },
                                "recipientEmail: ",
                                latestSubmissionLinkMeta.lastDispatch.recipientEmail)),
                            latestSubmissionLinkMeta.lastDispatch?.eventAt && (react_1.default.createElement("div", { className: "small" },
                                "eventAt: ",
                                latestSubmissionLinkMeta.lastDispatch.eventAt)),
                            latestSubmissionLinkMeta.lastDispatch?.status && (react_1.default.createElement("div", { className: "small" },
                                "status: ",
                                latestSubmissionLinkMeta.lastDispatch.status,
                                " (",
                                linkEventTypeLabel(latestSubmissionLinkMeta.lastDispatch.status),
                                ")"))))),
                    activeSubmission && activeSubmission.items.length > 0 && (react_1.default.createElement(react_bootstrap_1.Card, { className: "mt-3" },
                        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                            react_1.default.createElement("h6", null,
                                "Rekordy do recenzji (zgloszenie #",
                                activeSubmission.id,
                                ")"),
                            activeSubmission.items.every(i => i.itemStatus !== "PENDING") && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "success", className: "mb-2 py-1 small" }, "Wszystkie pozycje zostaly zarecenzowane \u2014 zgloszenie zamkniete.")),
                            activeSubmission.items.map(item => (react_1.default.createElement("div", { key: item.id, className: "d-flex align-items-center justify-content-between border-bottom py-2" },
                                react_1.default.createElement("div", null,
                                    react_1.default.createElement(react_bootstrap_1.Badge, { bg: itemTypeBadgeVariant(item.itemType), className: "me-2" }, item.itemType),
                                    react_1.default.createElement("span", null, renderItemPayloadSummary(item)),
                                    react_1.default.createElement(react_bootstrap_1.Badge, { bg: itemStatusBadgeVariant(item.itemStatus), className: "ms-2" }, itemStatusLabel(item.itemStatus))),
                                item.itemStatus === "PENDING" && (react_1.default.createElement("div", { className: "d-flex gap-1" },
                                    react_1.default.createElement(react_bootstrap_1.Button, { size: "sm", variant: "success", onClick: () => handleReviewItem(item.id, "ACCEPT"), disabled: reviewingItemId === item.id }, reviewingItemId === item.id ? "..." : "Akceptuj"),
                                    react_1.default.createElement(react_bootstrap_1.Button, { size: "sm", variant: "outline-danger", onClick: () => handleReviewItem(item.id, "REJECT"), disabled: reviewingItemId === item.id }, reviewingItemId === item.id ? "..." : "Odrzuc"))))))))))))),
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
            ], AddNewButtonComponents: [SkillAddButton], EditButtonComponent: SkillEditButton, isDeletable: true, showTableHeader: false, externalUpdate: tableExternalUpdate })) : (react_1.default.createElement("div", { className: "text-center py-3" },
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
            ], AddNewButtonComponents: [EducationAddButton], EditButtonComponent: EducationEditButton, isDeletable: true, showTableHeader: false, externalUpdate: tableExternalUpdate })) : (react_1.default.createElement("div", { className: "text-center py-3" },
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
            ], AddNewButtonComponents: [ExperienceAddButton], EditButtonComponent: ExperienceEditButton, isDeletable: true, showTableHeader: false, externalUpdate: tableExternalUpdate })) : (react_1.default.createElement("div", { className: "text-center py-3" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)))));
}
