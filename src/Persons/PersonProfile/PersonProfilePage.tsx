import React, { useEffect, useMemo, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import {
    PersonProfileEducationV2Record,
    PersonProfileExperienceV2Record,
    PersonProfileSkillV2Record,
    PersonProfileV2Full,
} from "../../../Typings/bussinesTypes";
import { fetchPersonProfileV2Full } from "../personsV2Helpers";
import { createEducationsRepository } from "./Education/EducationController";
import { createEducationAddNewModalButton, createEducationEditModalButton } from "./Education/EducationModalButtons";
import { createExperienceRepository } from "./Experience/ExperienceController";
import { createExperienceAddNewModalButton, createExperienceEditModalButton } from "./Experience/ExperienceModalButtons";
import { createProfileSkillsRepository } from "./ProfileSkills/ProfileSkillsController";
import { createProfileSkillAddNewModalButton, createProfileSkillEditModalButton } from "./ProfileSkills/ProfileSkillModalButtons";

function PersonProfileHeader({ personId }: { personId: number }) {
    const [profile, setProfile] = useState<PersonProfileV2Full | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        fetchPersonProfileV2Full(personId)
            .then((result) => {
                if (!cancelled) setProfile(result);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => { cancelled = true; };
    }, [personId]);

    if (isLoading) {
        return (
            <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
            </div>
        );
    }

    if (!profile) {
        return <p className="text-muted">Brak profilu dla osoby #{personId}</p>;
    }

    return (
        <div className="mb-4">
            {profile.headline && <h4 className="mb-1">{profile.headline}</h4>}
            {profile.summary && <p className="text-muted">{profile.summary}</p>}
        </div>
    );
}

export default function PersonProfilePage() {
    const { id } = useParams();
    const personId = parseInt(id!);

    useEffect(() => {
        document.title = `Profil osoby #${personId}`;
    }, [personId]);

    const educationsRepo = useMemo(() => createEducationsRepository(personId), [personId]);
    const experienceRepo = useMemo(() => createExperienceRepository(personId), [personId]);
    const skillsRepo = useMemo(() => createProfileSkillsRepository(personId), [personId]);

    const EducationAddButton = useMemo(() => createEducationAddNewModalButton(educationsRepo), [educationsRepo]);
    const EducationEditButton = useMemo(() => createEducationEditModalButton(educationsRepo), [educationsRepo]);
    const ExperienceAddButton = useMemo(() => createExperienceAddNewModalButton(experienceRepo), [experienceRepo]);
    const ExperienceEditButton = useMemo(() => createExperienceEditModalButton(experienceRepo), [experienceRepo]);
    const SkillAddButton = useMemo(() => createProfileSkillAddNewModalButton(skillsRepo), [skillsRepo]);
    const SkillEditButton = useMemo(() => createProfileSkillEditModalButton(skillsRepo), [skillsRepo]);

    function renderSkillName(skill: PersonProfileSkillV2Record) {
        return <>{skill._skill?.name || `Skill #${skill.skillId}`}</>;
    }

    function renderSkillLevel(skill: PersonProfileSkillV2Record) {
        return <>{skill.levelCode || "-"}</>;
    }

    function renderSkillYears(skill: PersonProfileSkillV2Record) {
        return <>{skill.yearsOfExperience != null ? `${skill.yearsOfExperience}` : "-"}</>;
    }

    return (
        <Container>
            <PersonProfileHeader personId={personId} />

            <h5>Specjalizacje</h5>
            <FilterableTable<PersonProfileSkillV2Record>
                id={`person_${personId}_skills`}
                repository={skillsRepo}
                tableStructure={[
                    { header: "Specjalizacja", renderTdBody: renderSkillName },
                    { header: "Poziom", renderTdBody: renderSkillLevel },
                    { header: "Lata doświadczenia", renderTdBody: renderSkillYears },
                ]}
                AddNewButtonComponents={[SkillAddButton]}
                EditButtonComponent={SkillEditButton}
                isDeletable={true}
            />

            <h5 className="mt-4">Wykształcenie</h5>
            <FilterableTable<PersonProfileEducationV2Record>
                id={`person_${personId}_educations`}
                repository={educationsRepo}
                tableStructure={[
                    { header: "Szkoła/Uczelnia", objectAttributeToShow: "schoolName" },
                    { header: "Tytuł/Stopień", objectAttributeToShow: "degreeName" },
                    { header: "Kierunek", objectAttributeToShow: "fieldOfStudy" },
                    { header: "Od", objectAttributeToShow: "dateFrom" },
                    { header: "Do", objectAttributeToShow: "dateTo" },
                ]}
                AddNewButtonComponents={[EducationAddButton]}
                EditButtonComponent={EducationEditButton}
                isDeletable={true}
            />

            <h5 className="mt-4">Doświadczenie</h5>
            <FilterableTable<PersonProfileExperienceV2Record>
                id={`person_${personId}_experiences`}
                repository={experienceRepo}
                tableStructure={[
                    { header: "Organizacja", objectAttributeToShow: "organizationName" },
                    { header: "Stanowisko", objectAttributeToShow: "positionName" },
                    { header: "Od", objectAttributeToShow: "dateFrom" },
                    { header: "Do", objectAttributeToShow: "dateTo" },
                ]}
                AddNewButtonComponents={[ExperienceAddButton]}
                EditButtonComponent={ExperienceEditButton}
                isDeletable={true}
            />
        </Container>
    );
}
