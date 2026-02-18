import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderSkillDictionaryNameCell } from "./SkillsDictionarySearch";

describe("renderSkillDictionaryNameCell", () => {
    it("renders placeholder when description is null", () => {
        render(
            renderSkillDictionaryNameCell({
                id: 1,
                name: "React",
                nameNormalized: "react",
                description: null,
            }),
        );
        expect(screen.getByText("React")).toBeInTheDocument();
        expect(screen.getByText("Brak opisu")).toBeInTheDocument();
    });

    it("renders description when available", () => {
        render(
            renderSkillDictionaryNameCell({
                id: 1,
                name: "React",
                nameNormalized: "react",
                description: "Biblioteka UI",
            }),
        );
        expect(screen.getByText("Biblioteka UI")).toBeInTheDocument();
    });
});
