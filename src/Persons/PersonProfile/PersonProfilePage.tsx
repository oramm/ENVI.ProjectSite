import React, { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
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

    useEffect(() => {
        document.title = `Profil osoby #${personId}`;
    }, [personId]);

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
                />
            ) : (
                <div className="text-center py-3">
                    <SpinnerBootstrap />
                </div>
            )}
        </Container>
    );
}
