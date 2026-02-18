import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { SkillDictionaryRecord } from "../../../Typings/bussinesTypes";
import { SkillDictionaryAddNewModalButton, SkillDictionaryEditModalButton } from "./Modals/SkillDictionaryModalButtons";
import { skillsDictionaryRepository } from "./SkillsDictionaryController";
import { SkillsDictionaryFilterBody } from "./SkillsDictionaryFilterBody";

export function renderSkillDictionaryNameCell(skill: SkillDictionaryRecord) {
    return (
        <div>
            <div>{skill.name}</div>
            <div className="text-muted small">{skill.description || "Brak opisu"}</div>
        </div>
    );
}

export default function SkillsDictionarySearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<SkillDictionaryRecord>
            id="skillsDictionary"
            title={title}
            FilterBodyComponent={SkillsDictionaryFilterBody}
            tableStructure={[{ header: undefined, renderTdBody: renderSkillDictionaryNameCell }]}
            AddNewButtonComponents={[SkillDictionaryAddNewModalButton]}
            EditButtonComponent={SkillDictionaryEditModalButton}
            isDeletable={true}
            repository={skillsDictionaryRepository}
            showTableHeader={false}
        />
    );
}
