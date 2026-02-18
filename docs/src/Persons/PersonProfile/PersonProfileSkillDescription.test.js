"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const vitest_1 = require("vitest");
const PersonProfilePage_1 = require("./PersonProfilePage");
const PersonProfilePanel_1 = require("../PersonProfilePanel");
const baseSkill = {
    id: 1,
    personProfileId: 1,
    skillId: 10,
    _skill: {
        id: 10,
        name: "React",
        nameNormalized: "react",
    },
};
(0, vitest_1.describe)("profile skill description render", () => {
    (0, vitest_1.it)("does not render extra description line when description is null", () => {
        (0, react_1.render)((0, PersonProfilePage_1.renderPersonProfileSkillNameCell)({
            ...baseSkill,
            _skill: { ...baseSkill._skill, description: null },
        }));
        (0, vitest_1.expect)(react_1.screen.getByText("React")).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.queryByText("Opis testowy")).not.toBeInTheDocument();
    });
    (0, vitest_1.it)("renders description line when description is present", () => {
        (0, react_1.render)((0, PersonProfilePage_1.renderPersonProfileSkillNameCell)({
            ...baseSkill,
            _skill: { ...baseSkill._skill, description: "Opis testowy" },
        }));
        (0, vitest_1.expect)(react_1.screen.getByText("Opis testowy")).toBeInTheDocument();
    });
    (0, vitest_1.it)("renders panel item with description when available", () => {
        (0, react_1.render)((0, PersonProfilePanel_1.renderPersonProfilePanelSkillItem)({
            ...baseSkill,
            _skill: { ...baseSkill._skill, description: "Panel opis" },
        }));
        (0, vitest_1.expect)(react_1.screen.getByText("Panel opis")).toBeInTheDocument();
    });
});
