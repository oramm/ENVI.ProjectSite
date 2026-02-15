import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { SkillDictionaryRecord } from "../../../Typings/bussinesTypes";
import { SkillDictionaryAddNewModalButton, SkillDictionaryEditModalButton } from "./Modals/SkillDictionaryModalButtons";
import { skillsDictionaryRepository } from "./SkillsDictionaryController";
import { SkillsDictionaryFilterBody } from "./SkillsDictionaryFilterBody";

export default function SkillsDictionarySearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<SkillDictionaryRecord>
            id="skillsDictionary"
            title={title}
            FilterBodyComponent={SkillsDictionaryFilterBody}
            tableStructure={[
                { header: "Nazwa", objectAttributeToShow: "name" },
            ]}
            AddNewButtonComponents={[SkillDictionaryAddNewModalButton]}
            EditButtonComponent={SkillDictionaryEditModalButton}
            isDeletable={true}
            repository={skillsDictionaryRepository}
        />
    );
}
