import { describe, expect, it } from "vitest";
import { mergeFormDataIntoItem } from "./GeneralModal";

/**
 * Regresja: `lodash.merge` łączył tablice po indeksie, przez co pola wielokrotnego
 * wyboru (sprawy pisma, podmioty) nie dawały się usuwać, a przy skracaniu listy
 * powstawały duplikaty łamiące UNIQUE w bazie (UNIQUE_LetterId_CaseId → 409).
 */
describe("mergeFormDataIntoItem", () => {
    const caseA = { id: 1, name: "A" };
    const caseB = { id: 2, name: "B" };

    it("usuwa pozycję z początku listy bez tworzenia duplikatu", () => {
        const result = mergeFormDataIntoItem({ id: 6148, _cases: [caseA, caseB] }, { _cases: [caseB] });

        expect(result._cases).toEqual([caseB]);
    });

    it("usuwa pozycję z końca listy", () => {
        const result = mergeFormDataIntoItem({ id: 6148, _cases: [caseA, caseB] }, { _cases: [caseA] });

        expect(result._cases).toEqual([caseA]);
    });

    it("pozwala wyczyścić całą listę", () => {
        const result = mergeFormDataIntoItem({ id: 6148, _cases: [caseA, caseB] }, { _cases: [] });

        expect(result._cases).toEqual([]);
    });

    it("nadpisuje też tablicę zagnieżdżoną w obiekcie z formularza", () => {
        const result = mergeFormDataIntoItem(
            { id: 6148, _newEvent: { _recipients: [caseA, caseB], comment: "stary" } },
            { _newEvent: { _recipients: [caseB] } }
        );

        expect(result._newEvent._recipients).toEqual([caseB]);
        expect(result._newEvent.comment).toBe("stary");
    });

    it("zachowuje pola spoza formularza i oryginalne dane", () => {
        const currentDataItem = { id: 6148, _cases: [caseA], gdFolderId: "folder-1" };

        const result = mergeFormDataIntoItem(currentDataItem, { _cases: [caseB], description: "nowy opis" });

        expect(result.gdFolderId).toBe("folder-1");
        expect(result.description).toBe("nowy opis");
        expect(result._originalData._cases).toEqual([caseA]);
    });

    it("nie rusza listy, której formularz nie przesłał", () => {
        const result = mergeFormDataIntoItem({ id: 6148, _cases: [caseA, caseB] }, { description: "tylko opis" });

        expect(result._cases).toEqual([caseA, caseB]);
    });
});
