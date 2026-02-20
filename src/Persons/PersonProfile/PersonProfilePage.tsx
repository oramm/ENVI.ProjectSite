import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Container, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
    PersonProfileEducationV2Record,
    PersonProfileExperienceV2Record,
    PersonProfileSkillV2Record,
    PersonProfileV2Record,
} from "../../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import ToolsDate from "../../React/Tools/ToolsDate";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { fetchPersonProfileV2 } from "../personsV2Helpers";
import { createEducationsRepository } from "./Education/EducationController";
import { createEducationAddNewModalButton, createEducationEditModalButton } from "./Education/EducationModalButtons";
import { createExperienceRepository } from "./Experience/ExperienceController";
import {
    createExperienceAddNewModalButton,
    createExperienceEditModalButton,
} from "./Experience/ExperienceModalButtons";
import { createProfileSkillsRepository } from "./ProfileSkills/ProfileSkillsController";
import {
    createProfileSkillAddNewModalButton,
    createProfileSkillEditModalButton,
} from "./ProfileSkills/ProfileSkillModalButtons";
import ProfileImportModal from "./Import/ProfileImportModal";
import {
    createSubmissionLink,
    searchSubmissions,
    getSubmissionDetails,
    reviewItem,
    isPersonPublicProfileSubmissionOfficeApiError,
    CreateLinkResponseDto,
    SubmissionSearchResultDto,
    SubmissionDetailsDto,
    SubmissionItemDto,
} from "./PublicProfileSubmission/personPublicProfileSubmissionReviewApi";

type PublicSubmissionProcessUiState = "PRE_START" | "ACTIVE" | "SUBMITTED" | "CLOSED";
type LinkDispatchStatus = NonNullable<CreateLinkResponseDto["lastDispatch"]>["status"];

function derivePublicSubmissionProcessUiState(
    submissions: SubmissionSearchResultDto[],
): PublicSubmissionProcessUiState {
    if (submissions.length === 0) return "PRE_START";

    if (submissions.some(s => s.status === "SUBMITTED")) return "SUBMITTED";
    if (submissions.some(s => s.status === "DRAFT")) return "ACTIVE";
    if (submissions.every(s => s.status === "CLOSED")) return "CLOSED";

    return "PRE_START";
}

function mapPublicSubmissionStateToBadgeVariant(state: PublicSubmissionProcessUiState): string {
    if (state === "SUBMITTED") return "success";
    if (state === "CLOSED") return "secondary";
    if (state === "ACTIVE") return "primary";
    return "secondary";
}

function mapPublicSubmissionStateToLabel(state: PublicSubmissionProcessUiState): string {
    if (state === "SUBMITTED") return "Wyslane";
    if (state === "CLOSED") return "Zamkniete";
    if (state === "ACTIVE") return "Aktywne";
    return "Nie zainicjowano";
}

function itemTypeBadgeVariant(itemType: SubmissionItemDto["itemType"]): string {
    if (itemType === "EXPERIENCE") return "primary";
    if (itemType === "EDUCATION") return "info";
    return "secondary";
}

function itemStatusBadgeVariant(itemStatus: SubmissionItemDto["itemStatus"]): string {
    if (itemStatus === "PENDING") return "warning";
    if (itemStatus === "ACCEPTED") return "success";
    return "danger";
}

function itemStatusLabel(itemStatus: SubmissionItemDto["itemStatus"]): string {
    if (itemStatus === "PENDING") return "Oczekuje";
    if (itemStatus === "ACCEPTED") return "Zaakceptowany";
    return "Odrzucony";
}

function renderItemPayloadSummary(item: SubmissionItemDto): string {
    const p = item.payload || {};
    if (item.itemType === "EXPERIENCE") {
        return [p.organizationName, p.positionName].filter(Boolean).join(" — ") || "Doswiadczenie";
    }
    if (item.itemType === "EDUCATION") {
        return [p.schoolName, p.degreeName, p.fieldOfStudy].filter(Boolean).join(" — ") || "Wyksztalcenie";
    }
    return [p.name, p.levelCode].filter(Boolean).join(" — ") || "Umiejetnosc";
}

function linkEventTypeLabel(eventType?: string | null): string {
    if (eventType === "LINK_SENT") return "Wyslano";
    if (eventType === "LINK_SEND_FAILED") return "Blad wysylki";
    return "Wygenerowano";
}

function dispatchAlertVariant(status?: LinkDispatchStatus): "info" | "success" | "warning" {
    if (status === "LINK_SENT") return "success";
    if (status === "LINK_SEND_FAILED") return "warning";
    return "info";
}

export function renderPersonProfileSkillNameCell(skill: PersonProfileSkillV2Record) {
    return (
        <div>
            <div>{skill._skill?.name || `Skill #${skill.skillId}`}</div>
            {skill._skill?.description && <div className="text-muted small">{skill._skill.description}</div>}
        </div>
    );
}

export default function PersonProfilePage() {
    const { id } = useParams();
    const personId = parseInt(id || "0");

    const [profile, setProfile] = useState<PersonProfileV2Record | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [skills, setSkills] = useState<PersonProfileSkillV2Record[] | undefined>(undefined);
    const [educations, setEducations] = useState<PersonProfileEducationV2Record[] | undefined>(undefined);
    const [experiences, setExperiences] = useState<PersonProfileExperienceV2Record[] | undefined>(undefined);
    const [submissions, setSubmissions] = useState<SubmissionSearchResultDto[]>([]);
    const [activeSubmission, setActiveSubmission] = useState<SubmissionDetailsDto | null>(null);
    const [publicReviewLoading, setPublicReviewLoading] = useState(true);
    const [publicReviewError, setPublicReviewError] = useState<string | null>(null);
    const [publicSubmissionInitLoading, setPublicSubmissionInitLoading] = useState(false);
    const [publicSubmissionInitError, setPublicSubmissionInitError] = useState<string | null>(null);
    const [createdLinkUrl, setCreatedLinkUrl] = useState<string | null>(null);
    const [linkRecipientEmail, setLinkRecipientEmail] = useState("");
    const [linkSendNow, setLinkSendNow] = useState(false);
    const [linkDispatch, setLinkDispatch] = useState<CreateLinkResponseDto["lastDispatch"] | null>(null);
    const [reviewingItemId, setReviewingItemId] = useState<number | null>(null);
    const [tableExternalUpdate, setTableExternalUpdate] = useState(0);

    const educationsRepo = useMemo(() => createEducationsRepository(personId), [personId]);
    const experienceRepo = useMemo(() => createExperienceRepository(personId), [personId]);
    const skillsRepo = useMemo(() => createProfileSkillsRepository(personId), [personId]);

    useEffect(() => {
        let cancelled = false;
        setProfileLoading(true);
        fetchPersonProfileV2(personId)
            .then((result) => {
                if (!cancelled) setProfile(result);
            })
            .finally(() => {
                if (!cancelled) setProfileLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [personId]);

    useEffect(() => {
        async function fetchSkills() {
            await skillsRepo.loadItemsFromServerPOST([]);
            setSkills([...skillsRepo.items]);
        }
        fetchSkills();
    }, [skillsRepo]);

    useEffect(() => {
        async function fetchEducations() {
            await educationsRepo.loadItemsFromServerPOST([]);
            setEducations([...educationsRepo.items]);
        }
        fetchEducations();
    }, [educationsRepo]);

    useEffect(() => {
        async function fetchExperiences() {
            await experienceRepo.loadItemsFromServerPOST([]);
            setExperiences([...experienceRepo.items]);
        }
        fetchExperiences();
    }, [experienceRepo]);

    const loadSubmissions = useCallback(async () => {
        setPublicReviewLoading(true);
        setPublicReviewError(null);
        try {
            const results = await searchSubmissions(personId);
            setSubmissions(results);
            // Auto-load details for the most recent SUBMITTED submission
            const submitted = results.find(s => s.status === "SUBMITTED");
            if (submitted) {
                const details = await getSubmissionDetails(personId, submitted.id);
                setActiveSubmission(details);
            } else {
                setActiveSubmission(null);
            }
        } catch (error) {
            if (isPersonPublicProfileSubmissionOfficeApiError(error)) {
                setPublicReviewError(`Nie udalo sie pobrac stanu procesu: ${error.message}`);
            } else {
                setPublicReviewError("Nie udalo sie pobrac stanu procesu aktualizacji doswiadczenia.");
            }
            setSubmissions([]);
            setActiveSubmission(null);
        } finally {
            setPublicReviewLoading(false);
        }
    }, [personId]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]);

    useEffect(() => {
        document.title = `Profil osoby #${personId}`;
    }, [personId]);

    const [showImportModal, setShowImportModal] = useState(false);
    const processState = derivePublicSubmissionProcessUiState(submissions);
    const latestSubmissionLinkMeta = useMemo(() => {
        if (submissions.length === 0) return null;
        return submissions[0] || null;
    }, [submissions]);

    const handleCreateLink = useCallback(async () => {
        setPublicSubmissionInitError(null);
        setPublicSubmissionInitLoading(true);
        setCreatedLinkUrl(null);
        setLinkDispatch(null);
        try {
            const normalizedRecipientEmail = linkRecipientEmail.trim();
            const linkResponse = await createSubmissionLink(personId, {
                recipientEmail: normalizedRecipientEmail ? normalizedRecipientEmail : undefined,
                sendNow: linkSendNow,
            });
            setCreatedLinkUrl(linkResponse.copyLink?.url || null);
            setLinkDispatch(linkResponse.lastDispatch || null);
            await loadSubmissions();
        } catch (error) {
            if (isPersonPublicProfileSubmissionOfficeApiError(error)) {
                setPublicSubmissionInitError(`Nie udalo sie wygenerowac linku: ${error.message}`);
            } else {
                setPublicSubmissionInitError("Nie udalo sie wygenerowac linku aktualizacji doswiadczenia.");
            }
        } finally {
            setPublicSubmissionInitLoading(false);
        }
    }, [linkRecipientEmail, linkSendNow, loadSubmissions, personId]);

    const handleReviewItem = useCallback(async (itemId: number, decision: "ACCEPT" | "REJECT") => {
        if (!activeSubmission) return;
        const rejectComment =
            decision === "REJECT"
                ? (window.prompt("Podaj komentarz dla odrzucenia (wymagany):", "") || "").trim()
                : undefined;
        if (decision === "REJECT" && !rejectComment) {
            setPublicReviewError("Komentarz jest wymagany dla decyzji Odrzuc.");
            return;
        }
        setReviewingItemId(itemId);
        try {
            const result = await reviewItem(personId, activeSubmission.id, itemId, decision, rejectComment);

            if (result.autoClosed) {
                // Submission closed — reload full list, clear review panel
                await loadSubmissions();
            } else {
                // Reload only the details of the current submission
                const details = await getSubmissionDetails(personId, activeSubmission.id);
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
        } catch (error) {
            if (isPersonPublicProfileSubmissionOfficeApiError(error)) {
                if (error.domainCode === "ITEM_ALREADY_RESOLVED") {
                    // Another reviewer already decided — silently refresh
                    const details = await getSubmissionDetails(personId, activeSubmission.id);
                    setActiveSubmission(details);
                } else {
                    setPublicReviewError(`Blad recenzji: ${error.domainCode}`);
                }
            } else {
                setPublicReviewError("Nie udalo sie wykonac recenzji.");
            }
        } finally {
            setReviewingItemId(null);
        }
    }, [activeSubmission, personId, loadSubmissions, skillsRepo, educationsRepo, experienceRepo]);

    const handleImportDone = useCallback(async () => {
        await Promise.all([
            skillsRepo.loadItemsFromServerPOST([]),
            educationsRepo.loadItemsFromServerPOST([]),
            experienceRepo.loadItemsFromServerPOST([]),
        ]);
        setSkills([...skillsRepo.items]);
        setEducations([...educationsRepo.items]);
        setExperiences([...experienceRepo.items]);
    }, [skillsRepo, educationsRepo, experienceRepo]);

    const EducationAddButton = useMemo(() => createEducationAddNewModalButton(educationsRepo), [educationsRepo]);
    const EducationEditButton = useMemo(() => createEducationEditModalButton(educationsRepo), [educationsRepo]);
    const ExperienceAddButton = useMemo(() => createExperienceAddNewModalButton(experienceRepo), [experienceRepo]);
    const ExperienceEditButton = useMemo(() => createExperienceEditModalButton(experienceRepo), [experienceRepo]);
    const SkillAddButton = useMemo(() => createProfileSkillAddNewModalButton(skillsRepo), [skillsRepo]);
    const SkillEditButton = useMemo(() => createProfileSkillEditModalButton(skillsRepo), [skillsRepo]);

    function renderSkillLevel(skill: PersonProfileSkillV2Record) {
        return <>{skill.levelCode || "-"}</>;
    }

    function renderSkillYears(skill: PersonProfileSkillV2Record) {
        return <>{skill.yearsOfExperience != null ? `${skill.yearsOfExperience}` : "-"}</>;
    }

    return (
        <Container>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="outline-secondary" onClick={() => setShowImportModal(true)}>
                    Importuj z CV
                </Button>
            </div>

            <ProfileImportModal
                personId={personId}
                show={showImportModal}
                onHide={() => setShowImportModal(false)}
                onImportDone={handleImportDone}
            />

            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Aktualizacja doswiadczenia</h5>
                        <div className="d-flex gap-2">
                            {processState !== "SUBMITTED" && (
                                <Button
                                    variant={processState === "CLOSED" ? "outline-primary" : "primary"}
                                    size="sm"
                                    onClick={handleCreateLink}
                                    disabled={publicSubmissionInitLoading}
                                >
                                    {publicSubmissionInitLoading
                                        ? "Generowanie..."
                                        : processState === "CLOSED"
                                          ? "Wygeneruj nowy link"
                                          : processState === "PRE_START"
                                            ? "Inicjuj proces"
                                            : "Wygeneruj / wyslij ponownie"}
                                </Button>
                            )}
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={loadSubmissions}
                                disabled={publicReviewLoading}
                            >
                                Odswiez
                            </Button>
                        </div>
                    </div>
                    {processState !== "SUBMITTED" && (
                        <div className="mb-2">
                            <div className="row g-2 align-items-end">
                                <div className="col-md-7">
                                    <Form.Label className="small text-muted mb-1">Email odbiorcy (opcjonalnie)</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={linkRecipientEmail}
                                        onChange={(e) => setLinkRecipientEmail(e.target.value)}
                                        disabled={publicSubmissionInitLoading}
                                    />
                                </div>
                                <div className="col-md-5">
                                    <Form.Check
                                        id="send-now-check"
                                        className="mt-4"
                                        type="checkbox"
                                        label="Wyslij email od razu (sendNow)"
                                        checked={linkSendNow}
                                        onChange={(e) => setLinkSendNow(e.currentTarget.checked)}
                                        disabled={publicSubmissionInitLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {publicReviewError && (
                        <Alert variant="warning" className="mb-2" dismissible onClose={() => setPublicReviewError(null)}>
                            {publicReviewError}
                        </Alert>
                    )}
                    {publicSubmissionInitError && (
                        <Alert variant="danger" className="mb-2" dismissible onClose={() => setPublicSubmissionInitError(null)}>
                            {publicSubmissionInitError}
                        </Alert>
                    )}

                    {publicReviewLoading ? (
                        <div className="text-muted small">Ladowanie stanu procesu...</div>
                    ) : (
                        <>
                            <div className="mb-2">
                                <Badge bg={mapPublicSubmissionStateToBadgeVariant(processState)}>
                                    {mapPublicSubmissionStateToLabel(processState)}
                                </Badge>
                                {submissions.length > 0 && <span className="text-muted small ms-2">(aktywny proces)</span>}
                            </div>

                            {processState === "PRE_START" && (
                                <Alert variant="secondary" className="mb-0">
                                    Proces aktualizacji doswiadczenia nie zostal jeszcze zainicjowany. Uzyj przycisku
                                    "Inicjuj proces", aby wygenerowac link i token dla kandydata.
                                </Alert>
                            )}

                            {createdLinkUrl && (
                                <Alert variant="info" className="mt-2" dismissible onClose={() => setCreatedLinkUrl(null)}>
                                    <div className="fw-bold mb-1">Link wygenerowany:</div>
                                    <a href={createdLinkUrl} target="_blank" rel="noreferrer" className="text-break">
                                        {createdLinkUrl}
                                    </a>
                                </Alert>
                            )}
                            {linkDispatch && (
                                <Alert
                                    variant={dispatchAlertVariant(linkDispatch.status)}
                                    className="mt-2"
                                    dismissible
                                    onClose={() => setLinkDispatch(null)}
                                >
                                    <div className="fw-bold mb-1">Wynik akcji linkowej</div>
                                    <div>Status dispatch: {linkDispatch.status}</div>
                                    {linkDispatch.recipientEmail && <div>Odbiorca: {linkDispatch.recipientEmail}</div>}
                                    {linkDispatch.eventAt && <div>Czas zdarzenia: {linkDispatch.eventAt}</div>}
                                </Alert>
                            )}

                            {processState === "ACTIVE" && (
                                <div className="small text-muted mt-2">
                                    Kolejny krok: kandydat wypelnia publiczny formularz i wysyla profil do recenzji.
                                </div>
                            )}

                            {processState === "CLOSED" && submissions.length > 0 && (
                                <div className="small text-muted mt-2">
                                    Proces zamkniety. Mozesz wygenerowac nowy link.
                                </div>
                            )}
                            {latestSubmissionLinkMeta && (
                                <Card className="mt-2">
                                    <Card.Body className="py-2">
                                        <div className="small fw-bold mb-1">Stan ostatniej wysylki i linku</div>
                                        {latestSubmissionLinkMeta.copyLink?.url && (
                                            <div className="small">
                                                copyLink: {latestSubmissionLinkMeta.copyLink.url}
                                            </div>
                                        )}
                                        {latestSubmissionLinkMeta.copyLink?.expiresAt && (
                                            <div className="small">expiresAt: {latestSubmissionLinkMeta.copyLink.expiresAt}</div>
                                        )}
                                        {latestSubmissionLinkMeta.lastDispatch?.recipientEmail && (
                                            <div className="small">
                                                recipientEmail: {latestSubmissionLinkMeta.lastDispatch.recipientEmail}
                                            </div>
                                        )}
                                        {latestSubmissionLinkMeta.lastDispatch?.eventAt && (
                                            <div className="small">eventAt: {latestSubmissionLinkMeta.lastDispatch.eventAt}</div>
                                        )}
                                        {latestSubmissionLinkMeta.lastDispatch?.status && (
                                            <div className="small">
                                                status: {latestSubmissionLinkMeta.lastDispatch.status} ({linkEventTypeLabel(latestSubmissionLinkMeta.lastDispatch.status)})
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {activeSubmission && activeSubmission.items.length > 0 && (
                                <Card className="mt-3">
                                    <Card.Body>
                                        <h6>Rekordy do recenzji (zgloszenie #{activeSubmission.id})</h6>
                                        {activeSubmission.items.every(i => i.itemStatus !== "PENDING") && (
                                            <Alert variant="success" className="mb-2 py-1 small">
                                                Wszystkie pozycje zostaly zarecenzowane — zgloszenie zamkniete.
                                            </Alert>
                                        )}
                                        {activeSubmission.items.map(item => (
                                            <div key={item.id} className="d-flex align-items-center justify-content-between border-bottom py-2">
                                                <div>
                                                    <Badge bg={itemTypeBadgeVariant(item.itemType)} className="me-2">
                                                        {item.itemType}
                                                    </Badge>
                                                    <span>{renderItemPayloadSummary(item)}</span>
                                                    <Badge bg={itemStatusBadgeVariant(item.itemStatus)} className="ms-2">
                                                        {itemStatusLabel(item.itemStatus)}
                                                    </Badge>
                                                </div>
                                                {item.itemStatus === "PENDING" && (
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => handleReviewItem(item.id, "ACCEPT")}
                                                            disabled={reviewingItemId === item.id}
                                                        >
                                                            {reviewingItemId === item.id ? "..." : "Akceptuj"}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => handleReviewItem(item.id, "REJECT")}
                                                            disabled={reviewingItemId === item.id}
                                                        >
                                                            {reviewingItemId === item.id ? "..." : "Odrzuc"}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {profileLoading ? (
                <div className="text-center py-3">
                    <SpinnerBootstrap />
                </div>
            ) : profile ? (
                <div className="mb-4">
                    {profile.headline && <h4 className="mb-1">{profile.headline}</h4>}
                    {profile.summary && <p className="text-muted">{profile.summary}</p>}
                </div>
            ) : (
                <p className="text-muted">Brak profilu dla osoby #{personId}</p>
            )}

            <h5>Specjalizacje</h5>
            {skills ? (
                <FilterableTable<PersonProfileSkillV2Record>
                    id={`person_${personId}_skills`}
                    repository={skillsRepo}
                    initialObjects={skills}
                    tableStructure={[
                        { header: "Specjalizacja", renderTdBody: renderPersonProfileSkillNameCell, colMd: 6 },
                        { header: "Poziom", renderTdBody: renderSkillLevel, colMd: 3 },
                        { header: "Lata doswiadczenia", renderTdBody: renderSkillYears, colMd: 3 },
                    ]}
                    AddNewButtonComponents={[SkillAddButton]}
                    EditButtonComponent={SkillEditButton}
                    isDeletable={true}
                    showTableHeader={false}
                    externalUpdate={tableExternalUpdate}
                />
            ) : (
                <div className="text-center py-3">
                    <SpinnerBootstrap />
                </div>
            )}

            <h5 className="mt-4">Wyksztalcenie</h5>
            {educations ? (
                <FilterableTable<PersonProfileEducationV2Record>
                    id={`person_${personId}_educations`}
                    repository={educationsRepo}
                    initialObjects={educations}
                    tableStructure={[
                        { header: "Szkola/Uczelnia", objectAttributeToShow: "schoolName", colMd: 3 },
                        { header: "Tytul/Stopien", objectAttributeToShow: "degreeName", colMd: 3 },
                        { header: "Kierunek", objectAttributeToShow: "fieldOfStudy", colMd: 3 },
                        {
                            header: "Od",
                            renderTdBody: (e: PersonProfileEducationV2Record) => (
                                <>{e.dateFrom ? ToolsDate.dateISOToDMY(e.dateFrom) : "-"}</>
                            ),
                            colMd: 1,
                        },
                        {
                            header: "Do",
                            renderTdBody: (e: PersonProfileEducationV2Record) => (
                                <>{e.dateTo ? ToolsDate.dateISOToDMY(e.dateTo) : "-"}</>
                            ),
                            colMd: 1,
                        },
                    ]}
                    AddNewButtonComponents={[EducationAddButton]}
                    EditButtonComponent={EducationEditButton}
                    isDeletable={true}
                    showTableHeader={false}
                    externalUpdate={tableExternalUpdate}
                />
            ) : (
                <div className="text-center py-3">
                    <SpinnerBootstrap />
                </div>
            )}

            <h5 className="mt-4">Doswiadczenie</h5>
            {experiences ? (
                <FilterableTable<PersonProfileExperienceV2Record>
                    id={`person_${personId}_experiences`}
                    repository={experienceRepo}
                    initialObjects={experiences}
                    tableStructure={[
                        { header: "Organizacja", objectAttributeToShow: "organizationName", colMd: 4 },
                        { header: "Stanowisko", objectAttributeToShow: "positionName", colMd: 4 },
                        {
                            header: "Od",
                            renderTdBody: (e: PersonProfileExperienceV2Record) => (
                                <>{e.dateFrom ? ToolsDate.dateISOToDMY(e.dateFrom) : "-"}</>
                            ),
                            colMd: 2,
                        },
                        {
                            header: "Do",
                            renderTdBody: (e: PersonProfileExperienceV2Record) => (
                                <>{e.dateTo ? ToolsDate.dateISOToDMY(e.dateTo) : "-"}</>
                            ),
                            colMd: 2,
                        },
                    ]}
                    AddNewButtonComponents={[ExperienceAddButton]}
                    EditButtonComponent={ExperienceEditButton}
                    isDeletable={true}
                    showTableHeader={false}
                    externalUpdate={tableExternalUpdate}
                />
            ) : (
                <div className="text-center py-3">
                    <SpinnerBootstrap />
                </div>
            )}
        </Container>
    );
}
