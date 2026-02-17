import React, { useEffect, useState } from "react";
import { Badge, Button, Card, CloseButton, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
    PersonData,
    PersonProfileV2Record,
    PersonProfileExperienceV2Record,
    PersonProfileEducationV2Record,
    PersonProfileSkillV2Record,
} from "../../Typings/bussinesTypes";
import {
    fetchPersonProfileEducations,
    fetchPersonProfileExperiences,
    fetchPersonProfileSkills,
    fetchPersonProfileV2,
} from "./personsV2Helpers";

function formatDateRange(dateFrom?: string, dateTo?: string, isCurrent?: boolean): string {
    const fmt = (d: string) => {
        try {
            return new Date(d).toLocaleDateString("pl-PL", { year: "numeric", month: "short" });
        } catch {
            return d;
        }
    };
    const from = dateFrom ? fmt(dateFrom) : "";
    const to = isCurrent ? "obecnie" : dateTo ? fmt(dateTo) : "";
    if (from && to) return `${from} – ${to}`;
    if (from) return `od ${from}`;
    if (to) return `do ${to}`;
    return "";
}

function ProfileHeader({ profile }: { profile: PersonProfileV2Record }) {
    return (
        <>
            {profile.headline && <h6 className="mb-1">{profile.headline}</h6>}
            {profile.summary && <p className="text-muted small mb-2">{profile.summary}</p>}
        </>
    );
}

function SkillsList({ skills }: { skills: PersonProfileSkillV2Record[] }) {
    if (!skills || skills.length === 0) return null;
    return (
        <div className="mb-3">
            <strong className="small">Specjalizacje</strong>
            <div className="mt-1">
                {skills.map((s) => (
                    <Badge key={s.id} bg="secondary" className="me-1 mb-1">
                        {s._skill?.name || `Skill #${s.skillId}`}
                        {s.levelCode && <span className="ms-1 opacity-75">({s.levelCode})</span>}
                    </Badge>
                ))}
            </div>
        </div>
    );
}

function ExperienceList({ experiences }: { experiences: PersonProfileExperienceV2Record[] }) {
    if (!experiences || experiences.length === 0) return null;
    return (
        <div className="mb-3">
            <strong className="small">Doświadczenie</strong>
            {experiences.map((exp) => (
                <div key={exp.id} className="mt-1 small">
                    <div>
                        <strong>{exp.positionName}</strong>
                        {exp.organizationName && <span className="text-muted"> — {exp.organizationName}</span>}
                    </div>
                    <div className="text-muted">{formatDateRange(exp.dateFrom, exp.dateTo, exp.isCurrent)}</div>
                    {exp.description && <div className="mt-1">{exp.description}</div>}
                </div>
            ))}
        </div>
    );
}

function EducationList({ educations }: { educations: PersonProfileEducationV2Record[] }) {
    if (!educations || educations.length === 0) return null;
    return (
        <div className="mb-3">
            <strong className="small">Wykształcenie</strong>
            {educations.map((edu) => (
                <div key={edu.id} className="mt-1 small">
                    <div>
                        <strong>{edu.schoolName}</strong>
                        {edu.degreeName && <span className="text-muted"> — {edu.degreeName}</span>}
                    </div>
                    {edu.fieldOfStudy && <div>{edu.fieldOfStudy}</div>}
                    <div className="text-muted">{formatDateRange(edu.dateFrom, edu.dateTo)}</div>
                </div>
            ))}
        </div>
    );
}

type PersonProfilePanelProps = {
    person: PersonData;
    onClose: () => void;
};

export default function PersonProfilePanel({ person, onClose }: PersonProfilePanelProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<PersonProfileV2Record | null>(null);
    const [skills, setSkills] = useState<PersonProfileSkillV2Record[]>([]);
    const [experiences, setExperiences] = useState<PersonProfileExperienceV2Record[]>([]);
    const [educations, setEducations] = useState<PersonProfileEducationV2Record[]>([]);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        Promise.all([
            fetchPersonProfileV2(person.id),
            fetchPersonProfileSkills(person.id),
            fetchPersonProfileExperiences(person.id),
            fetchPersonProfileEducations(person.id),
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

    return (
        <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>
                    {person.name} {person.surname}
                </strong>
                <CloseButton onClick={onClose} />
            </Card.Header>
            <Card.Body style={{ overflowY: "auto" }}>
                {isLoading && (
                    <div className="text-center py-3">
                        <Spinner animation="border" size="sm" />
                    </div>
                )}
                {error && <div className="text-danger small">{error}</div>}
                {!isLoading && !error && !profile && <p className="text-muted small">Brak profilu</p>}
                {!isLoading && !error && profile && (
                    <>
                        <ProfileHeader profile={profile} />
                        <SkillsList skills={skills} />
                        <ExperienceList experiences={experiences} />
                        <EducationList educations={educations} />
                        <div className="mt-3 text-end">
                            <Button as={Link as any} to={`/person/${person.id}`} variant="outline-primary" size="sm">
                                Pełny profil &rarr;
                            </Button>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
}
