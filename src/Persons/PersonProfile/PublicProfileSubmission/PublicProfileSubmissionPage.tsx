import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, ListGroup, Row, Spinner, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ProfileImportModal from "../Import/ProfileImportModal";
import {
    createPublicProfileSubmissionApi,
    isPublicProfileSubmissionApiError,
    PublicProfileSubmissionApi,
    PublicProfileSubmissionApiError,
} from "./publicProfileSubmissionApi";
import { createPublicProfileSubmissionImportApi } from "./publicProfileSubmissionImportApi";
import {
    PublicProfileSubmissionDraftEducationItem,
    PublicProfileSubmissionDraftExperienceItem,
    PublicProfileSubmissionDraftResponseDto,
    PublicProfileSubmissionDraftSkillItem,
    PublicProfileSubmissionInfoDto,
} from "./publicProfileSubmissionApi.types";

// ---------------------------------------------------------------------------
// Step state machine
// ---------------------------------------------------------------------------

type Step = "landing" | "verify" | "draft" | "submitted";

// ---------------------------------------------------------------------------
// Human-readable error messages for domain error codes
// ---------------------------------------------------------------------------

function domainErrorMessage(err: PublicProfileSubmissionApiError): string {
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

function formatError(error: unknown): string {
    if (isPublicProfileSubmissionApiError(error)) {
        return domainErrorMessage(error);
    }
    return error instanceof Error ? error.message : String(error);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PublicProfileSubmissionPage() {
    const { token } = useParams<{ token: string }>();

    // -- State machine step --
    const [step, setStep] = useState<Step>("landing");

    // -- Landing (W3) --
    const [submissionInfo, setSubmissionInfo] = useState<PublicProfileSubmissionInfoDto | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);

    // -- Verify (W4) --
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [codeExpiresAt, setCodeExpiresAt] = useState<string | null>(null);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isConfirmingCode, setIsConfirmingCode] = useState(false);

    // -- Draft (W5) --
    const [draftData, setDraftData] = useState<PublicProfileSubmissionDraftResponseDto | null>(null);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // -- Import modal (W6) --
    const [showImportModal, setShowImportModal] = useState(false);

    // -- Submit (W7) --
    const [isSubmitting, setIsSubmitting] = useState(false);

    // -- Messages --
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // -- API instance (stable across steps) --
    const api = useMemo(() => (token ? createPublicProfileSubmissionApi(token) : null), [token]);

    // Import adapter — created from api object (requires session token to be set before use)
    const importApi = useMemo(() => (api ? createPublicProfileSubmissionImportApi(api) : undefined), [api]);

    // -----------------------------------------------------------------------
    // W3: Landing — load submission info
    // -----------------------------------------------------------------------

    const loadSubmissionInfo = useCallback(async () => {
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
        } catch (error) {
            setErrorMessage(formatError(error));
        } finally {
            setIsLoadingInfo(false);
        }
    }, [api]);

    useEffect(() => {
        loadSubmissionInfo();
    }, [loadSubmissionInfo]);

    // -----------------------------------------------------------------------
    // W4: Email verification
    // -----------------------------------------------------------------------

    async function handleRequestCode() {
        if (!api || !email.trim()) return;
        setIsSendingCode(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const resp = await api.requestVerifyCode(email.trim());
            setCodeSent(true);
            setCodeExpiresAt(resp.codeExpiresAt);
            setSuccessMessage("Kod weryfikacyjny zostal wyslany na podany adres email.");
        } catch (error) {
            setErrorMessage(formatError(error));
        } finally {
            setIsSendingCode(false);
        }
    }

    async function handleConfirmCode() {
        if (!api || !email.trim() || !otpCode.trim()) return;
        setIsConfirmingCode(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const resp = await api.confirmVerifyCode(email.trim(), otpCode.trim());
            api.setSessionToken(resp.publicSessionToken);
            setSuccessMessage(null);
            // Proceed to draft step
            setStep("draft");
        } catch (error) {
            setErrorMessage(formatError(error));
        } finally {
            setIsConfirmingCode(false);
        }
    }

    // -----------------------------------------------------------------------
    // W5: Draft — load and save
    // -----------------------------------------------------------------------

    const loadDraft = useCallback(async () => {
        if (!api) return;
        setIsLoadingDraft(true);
        setErrorMessage(null);
        try {
            const draft = await api.getDraft();
            setDraftData(draft);
        } catch (error) {
            // If session expired, redirect back to verify
            if (isPublicProfileSubmissionApiError(error) && error.domainCode === "EMAIL_VERIFY_REQUIRED") {
                setStep("verify");
                setErrorMessage("Sesja wygasla. Zweryfikuj email ponownie.");
            } else {
                setErrorMessage(formatError(error));
            }
        } finally {
            setIsLoadingDraft(false);
        }
    }, [api]);

    // Load draft on entering the draft step
    useEffect(() => {
        if (step === "draft") {
            loadDraft();
        }
    }, [step, loadDraft]);

    async function handleSaveDraft() {
        if (!api || !draftData) return;
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
        } catch (error) {
            if (isPublicProfileSubmissionApiError(error) && error.domainCode === "EMAIL_VERIFY_REQUIRED") {
                setStep("verify");
                setErrorMessage("Sesja wygasla. Zweryfikuj email ponownie.");
            } else {
                setErrorMessage(formatError(error));
            }
        } finally {
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
        if (!api) return;
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            await api.submit();
            setStep("submitted");
            setSuccessMessage("Profil zostal wyslany do recenzji. Dziekujemy!");
        } catch (error) {
            if (isPublicProfileSubmissionApiError(error) && error.domainCode === "EMAIL_VERIFY_REQUIRED") {
                setStep("verify");
                setErrorMessage("Sesja wygasla. Zweryfikuj email ponownie.");
            } else {
                setErrorMessage(formatError(error));
            }
        } finally {
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

    const statusBadgeVariant: Record<string, string> = {
        DRAFT: "warning",
        SUBMITTED: "info",
        CLOSED: "secondary",
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    if (!token) {
        return (
            <Container className="py-4">
                <Alert variant="danger">Brak tokenu w URL.</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4" style={{ maxWidth: 800 }}>
            <h1 className="h4 mb-3">Zgloszenie profilu</h1>

            {errorMessage && (
                <Alert variant="danger" dismissible onClose={() => setErrorMessage(null)}>
                    {errorMessage}
                </Alert>
            )}
            {successMessage && (
                <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            {/* ============================================================ */}
            {/* W3: Landing */}
            {/* ============================================================ */}
            {step === "landing" && (
                <>
                    {isLoadingInfo ? (
                        <div className="py-4 text-center">
                            <Spinner animation="border" />
                            <div className="mt-2 text-muted">Ladowanie informacji...</div>
                        </div>
                    ) : submissionInfo ? (
                        <Card>
                            <Card.Body>
                                <h5 className="mb-3">Informacje o zgloszeniu</h5>
                                <Row className="mb-2">
                                    <Col sm={4} className="text-muted">Status:</Col>
                                    <Col sm={8}>
                                        <Badge bg={statusBadgeVariant[submissionInfo.status] || "secondary"}>
                                            {submissionInfo.status}
                                        </Badge>
                                    </Col>
                                </Row>
                                {submissionInfo.email && (
                                    <Row className="mb-2">
                                        <Col sm={4} className="text-muted">Email:</Col>
                                        <Col sm={8}>{submissionInfo.email}</Col>
                                    </Row>
                                )}
                                {submissionInfo.submittedAt && (
                                    <Row className="mb-2">
                                        <Col sm={4} className="text-muted">Wyslano:</Col>
                                        <Col sm={8}>{submissionInfo.submittedAt}</Col>
                                    </Row>
                                )}
                                {submissionInfo.closedAt && (
                                    <Row className="mb-2">
                                        <Col sm={4} className="text-muted">Zamknieto:</Col>
                                        <Col sm={8}>{submissionInfo.closedAt}</Col>
                                    </Row>
                                )}
                                {submissionInfo.items.length > 0 && (
                                    <Row className="mb-2">
                                        <Col sm={4} className="text-muted">Pozycje:</Col>
                                        <Col sm={8}>{submissionInfo.items.length}</Col>
                                    </Row>
                                )}

                                <hr />

                                {isTerminal ? (
                                    <Alert variant="info" className="mb-0">
                                        {submissionInfo.status === "SUBMITTED"
                                            ? "Zgloszenie zostalo juz wyslane i oczekuje na recenzje."
                                            : "Zgloszenie zostalo zamkniete."}
                                    </Alert>
                                ) : (
                                    <Button variant="primary" onClick={() => setStep("verify")}>
                                        Kontynuuj
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    ) : null}
                </>
            )}

            {/* ============================================================ */}
            {/* W4: Email Verification */}
            {/* ============================================================ */}
            {step === "verify" && (
                <Card>
                    <Card.Body>
                        <h5 className="mb-3">Weryfikacja adresu email</h5>
                        <p className="text-muted">
                            Aby kontynuowac, podaj adres email powiazany z tym zgloszeniem. Wyslemy na niego kod weryfikacyjny.
                        </p>

                        <Form.Group className="mb-3">
                            <Form.Label>Adres email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jan@example.com"
                                disabled={isSendingCode || isConfirmingCode}
                            />
                        </Form.Group>

                        {!codeSent ? (
                            <Button
                                variant="primary"
                                onClick={handleRequestCode}
                                disabled={!email.trim() || isSendingCode}
                            >
                                {isSendingCode ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Wysylanie...
                                    </>
                                ) : (
                                    "Wyslij kod"
                                )}
                            </Button>
                        ) : (
                            <>
                                {codeExpiresAt && (
                                    <div className="small text-muted mb-2">
                                        Kod wazny do: {codeExpiresAt}
                                    </div>
                                )}
                                <Form.Group className="mb-3">
                                    <Form.Label>Kod weryfikacyjny (6 cyfr)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        disabled={isConfirmingCode}
                                        style={{ maxWidth: 200, letterSpacing: "0.3em", fontWeight: 600 }}
                                    />
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleConfirmCode}
                                        disabled={otpCode.length !== 6 || isConfirmingCode}
                                    >
                                        {isConfirmingCode ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Weryfikacja...
                                            </>
                                        ) : (
                                            "Potwierdz"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setCodeSent(false);
                                            setOtpCode("");
                                            setCodeExpiresAt(null);
                                            setErrorMessage(null);
                                            setSuccessMessage(null);
                                        }}
                                        disabled={isConfirmingCode}
                                    >
                                        Wyslij ponownie
                                    </Button>
                                </div>
                            </>
                        )}

                        <div className="mt-3">
                            <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-muted"
                                onClick={() => {
                                    setStep("landing");
                                    setCodeSent(false);
                                    setOtpCode("");
                                    setErrorMessage(null);
                                    setSuccessMessage(null);
                                }}
                            >
                                Wroc do informacji o zgloszeniu
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* ============================================================ */}
            {/* W5: Draft Edit */}
            {/* ============================================================ */}
            {step === "draft" && (
                <>
                    {isLoadingDraft ? (
                        <div className="py-4 text-center">
                            <Spinner animation="border" />
                            <div className="mt-2 text-muted">Ladowanie draftu...</div>
                        </div>
                    ) : draftData ? (
                        <Card>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Edycja draftu</h5>
                                    <Badge bg={statusBadgeVariant[draftData.status] || "secondary"}>
                                        {draftData.status}
                                    </Badge>
                                </div>

                                {/* Experiences */}
                                <DraftExperiencesSection items={draftData.experiences} />

                                {/* Educations */}
                                <DraftEducationsSection items={draftData.educations} />

                                {/* Skills */}
                                <DraftSkillsSection items={draftData.skills} />

                                {draftData.experiences.length === 0 &&
                                    draftData.educations.length === 0 &&
                                    draftData.skills.length === 0 && (
                                        <Alert variant="info">
                                            Draft jest pusty. Uzyj przycisku "Importuj z CV" aby dodac dane.
                                        </Alert>
                                    )}

                                <hr />

                                <div className="d-flex gap-2 flex-wrap">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowImportModal(true)}
                                        disabled={isSavingDraft || isSubmitting}
                                    >
                                        Importuj z CV
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleSaveDraft}
                                        disabled={isSavingDraft || isSubmitting}
                                    >
                                        {isSavingDraft ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Zapisywanie...
                                            </>
                                        ) : (
                                            "Zapisz draft"
                                        )}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        disabled={isSavingDraft || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Wysylanie...
                                            </>
                                        ) : (
                                            "Wyslij do recenzji"
                                        )}
                                    </Button>
                                </div>

                                <div className="small text-muted mt-3">
                                    Pozycje zaimportowane z CV pozostaja w drafcie i sa wysylane razem z profilem.
                                </div>
                            </Card.Body>
                        </Card>
                    ) : null}
                </>
            )}

            {/* ============================================================ */}
            {/* W7: Submitted confirmation */}
            {/* ============================================================ */}
            {step === "submitted" && (
                <Card>
                    <Card.Body className="text-center py-5">
                        <h5 className="mb-3">Zgloszenie wyslane</h5>
                        <p className="text-muted">
                            Twoj profil zostal wyslany do recenzji. Otrzymasz powiadomienie emailem o wynikach.
                        </p>
                        <Badge bg="info" className="fs-6">SUBMITTED</Badge>
                    </Card.Body>
                </Card>
            )}

            {/* ============================================================ */}
            {/* W6: Import modal */}
            {/* ============================================================ */}
            <ProfileImportModal
                show={showImportModal}
                onHide={() => setShowImportModal(false)}
                onImportDone={handleImportDone}
                importApi={importApi}
                title="Import profilu z CV (publiczny)"
            />
        </Container>
    );
}

// ---------------------------------------------------------------------------
// Draft display sub-components
// ---------------------------------------------------------------------------

function DraftExperiencesSection({ items }: { items: PublicProfileSubmissionDraftExperienceItem[] }) {
    return (
        <div className="mb-4">
            <h6>Doswiadczenie ({items.length})</h6>
            {items.length === 0 ? (
                <p className="text-muted small">Brak pozycji.</p>
            ) : (
                <Table size="sm" bordered hover responsive className="small mb-0">
                    <thead>
                        <tr>
                            <th>Organizacja</th>
                            <th>Stanowisko</th>
                            <th>Okres</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.organizationName || "-"}</td>
                                <td>{item.positionName || "-"}</td>
                                <td>
                                    {item.dateFrom || "?"} - {item.isCurrent ? "obecnie" : item.dateTo || "?"}
                                </td>
                                <td>
                                    <Badge bg={itemStatusBadge(item.status)} className="text-uppercase">
                                        {item.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}

function DraftEducationsSection({ items }: { items: PublicProfileSubmissionDraftEducationItem[] }) {
    return (
        <div className="mb-4">
            <h6>Wyksztalcenie ({items.length})</h6>
            {items.length === 0 ? (
                <p className="text-muted small">Brak pozycji.</p>
            ) : (
                <Table size="sm" bordered hover responsive className="small mb-0">
                    <thead>
                        <tr>
                            <th>Uczelnia</th>
                            <th>Tytul</th>
                            <th>Kierunek</th>
                            <th>Okres</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.schoolName || "-"}</td>
                                <td>{item.degreeName || "-"}</td>
                                <td>{item.fieldOfStudy || "-"}</td>
                                <td>
                                    {item.dateFrom || "?"} - {item.dateTo || "?"}
                                </td>
                                <td>
                                    <Badge bg={itemStatusBadge(item.status)} className="text-uppercase">
                                        {item.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}

function DraftSkillsSection({ items }: { items: PublicProfileSubmissionDraftSkillItem[] }) {
    return (
        <div className="mb-4">
            <h6>Umiejetnosci ({items.length})</h6>
            {items.length === 0 ? (
                <p className="text-muted small">Brak pozycji.</p>
            ) : (
                <Table size="sm" bordered hover responsive className="small mb-0">
                    <thead>
                        <tr>
                            <th>Nazwa</th>
                            <th>Poziom</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.name || "-"}</td>
                                <td>{item.levelCode || "-"}</td>
                                <td>
                                    <Badge bg={itemStatusBadge(item.status)} className="text-uppercase">
                                        {item.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}

function itemStatusBadge(status: string): string {
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

function stripDraftItemMeta<T extends { id: number; status: string }>(
    item: T,
): Omit<T, "id" | "status"> {
    const { id, status, ...rest } = item;
    return rest;
}
