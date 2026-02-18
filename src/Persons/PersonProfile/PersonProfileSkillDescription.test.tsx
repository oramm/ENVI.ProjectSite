import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PersonProfileSkillV2Record } from "../../../Typings/bussinesTypes";
import { renderPersonProfileSkillNameCell } from "./PersonProfilePage";
import { renderPersonProfilePanelSkillItem } from "../PersonProfilePanel";

const baseSkill: PersonProfileSkillV2Record = {
    id: 1,
    personProfileId: 1,
    skillId: 10,
    _skill: {
        id: 10,
        name: "React",
        nameNormalized: "react",
    },
};

describe("profile skill description render", () => {
    it("does not render extra description line when description is null", () => {
        render(
            renderPersonProfileSkillNameCell({
                ...baseSkill,
                _skill: { ...baseSkill._skill!, description: null },
            }),
        );
        expect(screen.getByText("React")).toBeInTheDocument();
        expect(screen.queryByText("Opis testowy")).not.toBeInTheDocument();
    });

    it("renders description line when description is present", () => {
        render(
            renderPersonProfileSkillNameCell({
                ...baseSkill,
                _skill: { ...baseSkill._skill!, description: "Opis testowy" },
            }),
        );
        expect(screen.getByText("Opis testowy")).toBeInTheDocument();
    });

    it("renders panel item with description when available", () => {
        render(
            renderPersonProfilePanelSkillItem({
                ...baseSkill,
                _skill: { ...baseSkill._skill!, description: "Panel opis" },
            }),
        );
        expect(screen.getByText("Panel opis")).toBeInTheDocument();
    });
});
