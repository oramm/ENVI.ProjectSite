"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const vitest_1 = require("vitest");
const SkillsDictionarySearch_1 = require("./SkillsDictionarySearch");
(0, vitest_1.describe)("renderSkillDictionaryNameCell", () => {
    (0, vitest_1.it)("renders placeholder when description is null", () => {
        (0, react_1.render)((0, SkillsDictionarySearch_1.renderSkillDictionaryNameCell)({
            id: 1,
            name: "React",
            nameNormalized: "react",
            description: null,
        }));
        (0, vitest_1.expect)(react_1.screen.getByText("React")).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText("Brak opisu")).toBeInTheDocument();
    });
    (0, vitest_1.it)("renders description when available", () => {
        (0, react_1.render)((0, SkillsDictionarySearch_1.renderSkillDictionaryNameCell)({
            id: 1,
            name: "React",
            nameNormalized: "react",
            description: "Biblioteka UI",
        }));
        (0, vitest_1.expect)(react_1.screen.getByText("Biblioteka UI")).toBeInTheDocument();
    });
});
