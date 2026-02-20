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
exports.default = PublicProfileSubmissionPage;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const ProfileImportModal_1 = __importDefault(require("../Import/ProfileImportModal"));
const publicProfileSubmissionApi_1 = require("./publicProfileSubmissionApi");
const publicProfileSubmissionImportApi_1 = require("./publicProfileSubmissionImportApi");
// ---------------------------------------------------------------------------
// Human-readable error messages for domain error codes
// ---------------------------------------------------------------------------
function domainErrorMessage(err) {
    switch (err.domainCode) {
        case "PUBLIC_TOKEN_INVALID":
            return "Link jest nieprawidlowy lub zostal uniewazniony.";
        case "PUBLIC_TOKEN_EXPIRED":
            return "Link wygasl. Popros o wygenerowanie nowego.";
        case "EMAIL_CODE_INVALID":
            return "Kod weryfikacyjny jest nieprawidlowy. Sprawdz i sprobuj ponownie.";
        case "EMAIL_CODE_EXPIRED":
            return "Kod weryfikacyjny wygasl. Wyslij nowy kod.";
        case "EMAIL_VERIFY_RATE_LIMITED":
            return "Zbyt wiele prob. Sprobuj pozniej lub popros o nowy link.";
        case "EMAIL_VERIFY_REQUIRED":
            return "Sesja wygasla. Zweryfikuj email ponownie.";
        case "SUBMISSION_ALREADY_CLOSED":
            return "Zgloszenie zostalo juz zamkniete.";
        case "SUBMISSION_NOT_FOUND":
            return "Zgloszenie nie zostalo znalezione.";
        case "DRAFT_VALIDATION_FAILED":
            return "Dane draftu sa niepoprawne. Sprawdz formularz.";
        case "FORBIDDEN":
            return "Brak dostepu.";
        default:
            return "Wystapil nieoczekiwany blad.";
    }
}
function formatError(error) {
    if ((0, publicProfileSubmissionApi_1.isPublicProfileSubmissionApiError)(error)) {
        return domainErrorMessage(error);
    }
    return error instanceof Error ? error.message : String(error);
}
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function PublicProfileSubmissionPage() {
    const { token } = (0, react_router_dom_1.useParams)();
    // -- State machine step --
    const [step, setStep] = (0, react_1.useState)("landing");
    // -- Landing (W3) --
    const [submissionInfo, setSubmissionInfo] = (0, react_1.useState)(null);
    const [isLoadingInfo, setIsLoadingInfo] = (0, react_1.useState)(true);
    // -- Verify (W4) --
    const [email, setEmail] = (0, react_1.useState)("");
    const [otpCode, setOtpCode] = (0, react_1.useState)("");
    const [codeSent, setCodeSent] = (0, react_1.useState)(false);
    const [codeExpiresAt, setCodeExpiresAt] = (0, react_1.useState)(null);
    const [isSendingCode, setIsSendingCode] = (0, react_1.useState)(false);
    const [isConfirmingCode, setIsConfirmingCode] = (0, react_1.useState)(false);
    // -- Draft (W5) --
    const [draftData, setDraftData] = (0, react_1.useState)(null);
    const [isLoadingDraft, setIsLoadingDraft] = (0, react_1.useState)(false);
    const [isSavingDraft, setIsSavingDraft] = (0, react_1.useState)(false);
    // -- Import modal (W6) --
    const [showImportModal, setShowImportModal] = (0, react_1.useState)(false);
    // -- Submit (W7) --
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    // -- Messages --
    const [errorMessage, setErrorMessage] = (0, react_1.useState)(null);
    const [successMessage, setSuccessMessage] = (0, react_1.useState)(null);
    // -- API instance (stable across steps) --
    const api = (0, react_1.useMemo)(() => (token ? (0, publicProfileSubmissionApi_1.createPublicProfileSubmissionApi)(token) : null), [token]);
    // Import adapter — created from api object (requires session token to be set before use)
    const importApi = (0, react_1.useMemo)(() => (api ? (0, publicProfileSubmissionImportApi_1.createPublicProfileSubmissionImportApi)(api) : undefined), [api]);
    // -----------------------------------------------------------------------
    // W3: Landing — load submission info
    // -----------------------------------------------------------------------
    const loadSubmissionInfo = (0, react_1.useCallback)(async () => {
        if (!api) {
            setIsLoadingInfo(false);
            return;
        }
        setIsLoadingInfo(true);
        setErrorMessage(null);
        try {
            const info = await api.getSubmissionInfo();
            setSubmissionInfo(info);
            // Pre-fill email if available
            if (info.email) {
                setEmail(info.email);
            }
        }
        catch (error) {
            setErrorMessage(formatError(error));
        }
        finally {
            setIsLoadingInfo(false);
        }
    }, [api]);
    (0, react_1.useEffect)(() => {
        loadSubmissionInfo();
    }, [loadSubmissionInfo]);
    // -----------------------------------------------------------------------
    // W4: Email verification
    // -----------------------------------------------------------------------
    async function handleRequestCode() {
        if (!api || !email.trim())
            return;
        setIsSendingCode(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const resp = await api.requestVerifyCode(email.trim());
            setCodeSent(true);
            setCodeExpiresAt(resp.codeExpiresAt);
            setSuccessMessage("Kod weryfikacyjny zostal wyslany na podany adres email.");
        }
        catch (error) {
            setErrorMessage(formatError(error));
        }
        finally {
            setIsSendingCode(false);
        }
    }
    async function handleConfirmCode() {
        if (!api || !email.trim() || !otpCode.trim())
            return;
        setIsConfirmingCode(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const resp = await api.confirmVerifyCode(email.trim(), otpCode.trim());
            api.setSessionToken(resp.publicSessionToken);
            setSuccessMessage(null);
            // Proceed to draft step
            setStep("draft");
        }
        catch (error) {
            setErrorMessage(formatError(error));
        }
        finally {
            setIsConfirmingCode(false);
        }
    }
    // -----------------------------------------------------------------------
    // W5: Draft — load and save
    // -----------------------------------------------------------------------
    const loadDraft = (0, react_1.useCallback)(async () => {
        if (!api)
            return;
        setIsLoadingDraft(true);
        setErrorMessage(null);
        try {
            const draft = await api.getDraft();
            setDraftData(draft);
        }
        catch (error) {
            // If session expired, redirect back to verify
            if ((0, publicProfileSubmissionApi_1.isPublicProfileSubmissionApiError)(error) && error.domainCode === "EMAIL_VERIFY_REQUIRED") {
                setStep("verify");
                setErrorMessage("Sesja wygasla. Zweryfikuj email ponownie.");
            }
            else {
                setErrorMessage(formatError(error));
            }
        }
        finally {
            setIsLoadingDraft(false);
        }
    }, [api]);
    // Load draft on entering the draft step
    (0, react_1.useEffect)(() => {
        if (step === "draft") {
            loadDraft();
        }
    }, [step, loadDraft]);
    async function handleSaveDraft() {
        if (!api || !draftData)
            return;
        setIsSavingDraft(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const updated = await api.updateDraft({
                experiences: draftData.experiences.map(stripDraftItemMeta),
                educations: draftData.educations.map(stripDraftItemMeta),
                skills: draftData.skills.map(stripDraftItemMeta),
            });
            setDraftData(updated);
            setSuccessMessage("Draft zapisany.");
        }
        catch (error) {
            if ((0, publicProfileSubmissionApi_1.isPublicProfileSubmissionApiError)(error) && error.domainCode === "EMAIL_VERIFY_REQUIRED") {
                setStep("verify");
                setErrorMessage("Sesja wygasla. Zweryfikuj email ponownie.");
            }
            else {
                setErrorMessage(formatError(error));
            }
        }
        finally {
            setIsSavingDraft(false);
        }
    }
    // -----------------------------------------------------------------------
    // W6: Import done callback
    // -----------------------------------------------------------------------
    function handleImportDone() {
        setShowImportModal(false);
        loadDraft();
    }
    // -----------------------------------------------------------------------
    // W7: Submit
    // -----------------------------------------------------------------------
    async function handleSubmit() {
        if (!api)
            return;
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            await api.submit();
            setStep("submitted");
            setSuccessMessage("Profil zostal wyslany do recenzji. Dziekujemy!");
        }
        catch (error) {
            if ((0, publicProfileSubmissionApi_1.isPublicProfileSubmissionApiError)(error) && error.domainCode === "EMAIL_VERIFY_REQUIRED") {
                setStep("verify");
                setErrorMessage("Sesja wygasla. Zweryfikuj email ponownie.");
            }
            else {
                setErrorMessage(formatError(error));
            }
        }
        finally {
            setIsSubmitting(false);
        }
    }
    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------
    /** Check if submission is in a terminal state (no further actions) */
    const isTerminal = submissionInfo
        ? submissionInfo.status === "SUBMITTED" || submissionInfo.status === "CLOSED"
        : false;
    const statusBadgeVariant = {
        DRAFT: "warning",
        SUBMITTED: "info",
        CLOSED: "secondary",
    };
    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    if (!token) {
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "py-4" },
            react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, "Brak tokenu w URL.")));
    }
    return (react_1.default.createElement(react_bootstrap_1.Container, { className: "py-4", style: { maxWidth: 800 } },
        react_1.default.createElement("h1", { className: "h4 mb-3" }, "Zgloszenie profilu"),
        errorMessage && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", dismissible: true, onClose: () => setErrorMessage(null) }, errorMessage)),
        successMessage && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "success", dismissible: true, onClose: () => setSuccessMessage(null) }, successMessage)),
        step === "landing" && (react_1.default.createElement(react_1.default.Fragment, null, isLoadingInfo ? (react_1.default.createElement("div", { className: "py-4 text-center" },
            react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border" }),
            react_1.default.createElement("div", { className: "mt-2 text-muted" }, "Ladowanie informacji..."))) : submissionInfo ? (react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement("h5", { className: "mb-3" }, "Informacje o zgloszeniu"),
                react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-2" },
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, className: "text-muted" }, "Status:"),
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 8 },
                        react_1.default.createElement(react_bootstrap_1.Badge, { bg: statusBadgeVariant[submissionInfo.status] || "secondary" }, submissionInfo.status))),
                submissionInfo.email && (react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-2" },
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, className: "text-muted" }, "Email:"),
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 8 }, submissionInfo.email))),
                submissionInfo.submittedAt && (react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-2" },
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, className: "text-muted" }, "Wyslano:"),
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 8 }, submissionInfo.submittedAt))),
                submissionInfo.closedAt && (react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-2" },
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, className: "text-muted" }, "Zamknieto:"),
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 8 }, submissionInfo.closedAt))),
                submissionInfo.items.length > 0 && (react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-2" },
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, className: "text-muted" }, "Pozycje:"),
                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 8 }, submissionInfo.items.length))),
                react_1.default.createElement("hr", null),
                isTerminal ? (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info", className: "mb-0" }, submissionInfo.status === "SUBMITTED"
                    ? "Zgloszenie zostalo juz wyslane i oczekuje na recenzje."
                    : "Zgloszenie zostalo zamkniete.")) : (react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: () => setStep("verify") }, "Kontynuuj"))))) : null)),
        step === "verify" && (react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement("h5", { className: "mb-3" }, "Weryfikacja adresu email"),
                react_1.default.createElement("p", { className: "text-muted" }, "Aby kontynuowac, podaj adres email powiazany z tym zgloszeniem. Wyslemy na niego kod weryfikacyjny."),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Adres email"),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "jan@example.com", disabled: isSendingCode || isConfirmingCode })),
                !codeSent ? (react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleRequestCode, disabled: !email.trim() || isSendingCode }, isSendingCode ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                    "Wysylanie...")) : ("Wyslij kod"))) : (react_1.default.createElement(react_1.default.Fragment, null,
                    codeExpiresAt && (react_1.default.createElement("div", { className: "small text-muted mb-2" },
                        "Kod wazny do: ",
                        codeExpiresAt)),
                    react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kod weryfikacyjny (6 cyfr)"),
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", inputMode: "numeric", maxLength: 6, value: otpCode, onChange: (e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6)), placeholder: "000000", disabled: isConfirmingCode, style: { maxWidth: 200, letterSpacing: "0.3em", fontWeight: 600 } })),
                    react_1.default.createElement("div", { className: "d-flex gap-2" },
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleConfirmCode, disabled: otpCode.length !== 6 || isConfirmingCode }, isConfirmingCode ? (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                            "Weryfikacja...")) : ("Potwierdz")),
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", onClick: () => {
                                setCodeSent(false);
                                setOtpCode("");
                                setCodeExpiresAt(null);
                                setErrorMessage(null);
                                setSuccessMessage(null);
                            }, disabled: isConfirmingCode }, "Wyslij ponownie")))),
                react_1.default.createElement("div", { className: "mt-3" },
                    react_1.default.createElement(react_bootstrap_1.Button, { variant: "link", size: "sm", className: "p-0 text-muted", onClick: () => {
                            setStep("landing");
                            setCodeSent(false);
                            setOtpCode("");
                            setErrorMessage(null);
                            setSuccessMessage(null);
                        } }, "Wroc do informacji o zgloszeniu"))))),
        step === "draft" && (react_1.default.createElement(react_1.default.Fragment, null, isLoadingDraft ? (react_1.default.createElement("div", { className: "py-4 text-center" },
            react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border" }),
            react_1.default.createElement("div", { className: "mt-2 text-muted" }, "Ladowanie draftu..."))) : draftData ? (react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center mb-3" },
                    react_1.default.createElement("h5", { className: "mb-0" }, "Edycja draftu"),
                    react_1.default.createElement(react_bootstrap_1.Badge, { bg: statusBadgeVariant[draftData.status] || "secondary" }, draftData.status)),
                react_1.default.createElement(DraftExperiencesSection, { items: draftData.experiences }),
                react_1.default.createElement(DraftEducationsSection, { items: draftData.educations }),
                react_1.default.createElement(DraftSkillsSection, { items: draftData.skills }),
                draftData.experiences.length === 0 &&
                    draftData.educations.length === 0 &&
                    draftData.skills.length === 0 && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info" }, "Draft jest pusty. Uzyj przycisku \"Importuj z CV\" aby dodac dane.")),
                react_1.default.createElement("hr", null),
                react_1.default.createElement("div", { className: "d-flex gap-2 flex-wrap" },
                    react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", onClick: () => setShowImportModal(true), disabled: isSavingDraft || isSubmitting }, "Importuj z CV"),
                    react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: handleSaveDraft, disabled: isSavingDraft || isSubmitting }, isSavingDraft ? (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                        "Zapisywanie...")) : ("Zapisz draft")),
                    react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleSubmit, disabled: isSavingDraft || isSubmitting }, isSubmitting ? (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                        "Wysylanie...")) : ("Wyslij do recenzji"))),
                react_1.default.createElement("div", { className: "small text-muted mt-3" }, "Pozycje zaimportowane z CV pozostaja w drafcie i sa wysylane razem z profilem.")))) : null)),
        step === "submitted" && (react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "text-center py-5" },
                react_1.default.createElement("h5", { className: "mb-3" }, "Zgloszenie wyslane"),
                react_1.default.createElement("p", { className: "text-muted" }, "Twoj profil zostal wyslany do recenzji. Otrzymasz powiadomienie emailem o wynikach."),
                react_1.default.createElement(react_bootstrap_1.Badge, { bg: "info", className: "fs-6" }, "SUBMITTED")))),
        react_1.default.createElement(ProfileImportModal_1.default, { show: showImportModal, onHide: () => setShowImportModal(false), onImportDone: handleImportDone, importApi: importApi, title: "Import profilu z CV (publiczny)" })));
}
// ---------------------------------------------------------------------------
// Draft display sub-components
// ---------------------------------------------------------------------------
function DraftExperiencesSection({ items }) {
    return (react_1.default.createElement("div", { className: "mb-4" },
        react_1.default.createElement("h6", null,
            "Doswiadczenie (",
            items.length,
            ")"),
        items.length === 0 ? (react_1.default.createElement("p", { className: "text-muted small" }, "Brak pozycji.")) : (react_1.default.createElement(react_bootstrap_1.Table, { size: "sm", bordered: true, hover: true, responsive: true, className: "small mb-0" },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", null, "Organizacja"),
                    react_1.default.createElement("th", null, "Stanowisko"),
                    react_1.default.createElement("th", null, "Okres"),
                    react_1.default.createElement("th", null, "Status"))),
            react_1.default.createElement("tbody", null, items.map((item) => (react_1.default.createElement("tr", { key: item.id },
                react_1.default.createElement("td", null, item.organizationName || "-"),
                react_1.default.createElement("td", null, item.positionName || "-"),
                react_1.default.createElement("td", null,
                    item.dateFrom || "?",
                    " - ",
                    item.isCurrent ? "obecnie" : item.dateTo || "?"),
                react_1.default.createElement("td", null,
                    react_1.default.createElement(react_bootstrap_1.Badge, { bg: itemStatusBadge(item.status), className: "text-uppercase" }, item.status))))))))));
}
function DraftEducationsSection({ items }) {
    return (react_1.default.createElement("div", { className: "mb-4" },
        react_1.default.createElement("h6", null,
            "Wyksztalcenie (",
            items.length,
            ")"),
        items.length === 0 ? (react_1.default.createElement("p", { className: "text-muted small" }, "Brak pozycji.")) : (react_1.default.createElement(react_bootstrap_1.Table, { size: "sm", bordered: true, hover: true, responsive: true, className: "small mb-0" },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", null, "Uczelnia"),
                    react_1.default.createElement("th", null, "Tytul"),
                    react_1.default.createElement("th", null, "Kierunek"),
                    react_1.default.createElement("th", null, "Okres"),
                    react_1.default.createElement("th", null, "Status"))),
            react_1.default.createElement("tbody", null, items.map((item) => (react_1.default.createElement("tr", { key: item.id },
                react_1.default.createElement("td", null, item.schoolName || "-"),
                react_1.default.createElement("td", null, item.degreeName || "-"),
                react_1.default.createElement("td", null, item.fieldOfStudy || "-"),
                react_1.default.createElement("td", null,
                    item.dateFrom || "?",
                    " - ",
                    item.dateTo || "?"),
                react_1.default.createElement("td", null,
                    react_1.default.createElement(react_bootstrap_1.Badge, { bg: itemStatusBadge(item.status), className: "text-uppercase" }, item.status))))))))));
}
function DraftSkillsSection({ items }) {
    return (react_1.default.createElement("div", { className: "mb-4" },
        react_1.default.createElement("h6", null,
            "Umiejetnosci (",
            items.length,
            ")"),
        items.length === 0 ? (react_1.default.createElement("p", { className: "text-muted small" }, "Brak pozycji.")) : (react_1.default.createElement(react_bootstrap_1.Table, { size: "sm", bordered: true, hover: true, responsive: true, className: "small mb-0" },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", null, "Nazwa"),
                    react_1.default.createElement("th", null, "Poziom"),
                    react_1.default.createElement("th", null, "Status"))),
            react_1.default.createElement("tbody", null, items.map((item) => (react_1.default.createElement("tr", { key: item.id },
                react_1.default.createElement("td", null, item.name || "-"),
                react_1.default.createElement("td", null, item.levelCode || "-"),
                react_1.default.createElement("td", null,
                    react_1.default.createElement(react_bootstrap_1.Badge, { bg: itemStatusBadge(item.status), className: "text-uppercase" }, item.status))))))))));
}
function itemStatusBadge(status) {
    switch (status) {
        case "PENDING":
            return "warning";
        case "ACCEPTED":
            return "success";
        case "REJECTED":
            return "danger";
        default:
            return "secondary";
    }
}
// ---------------------------------------------------------------------------
// Utility: strip id/status from draft items for PUT /draft payload
// ---------------------------------------------------------------------------
function stripDraftItemMeta(item) {
    const { id, status, ...rest } = item;
    return rest;
}
