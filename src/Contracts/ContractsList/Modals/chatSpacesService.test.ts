import { describe, expect, it } from "vitest";
import * as Yup from "yup";
import { ourContractValidationSchema } from "./ContractValidationSchema";
import { describeMemberState, suggestChatSpaceName } from "./chatSpacesService";

describe("suggestChatSpaceName", () => {
    it("składa oznaczenie z aliasem, a bez aliasu z nazwą", () => {
        expect(suggestChatSpaceName("MYT.O.12", "Sieć", "Długa nazwa")).toBe("MYT.O.12 Sieć");
        expect(suggestChatSpaceName("MYT.O.12", "  ", "Długa nazwa")).toBe("MYT.O.12 Długa nazwa");
    });

    it("tnie do 128 znaków", () => {
        expect(suggestChatSpaceName("X", "", "a".repeat(300))).toHaveLength(128);
    });
});

describe("describeMemberState", () => {
    it("INVITED to zaproszenie, nie dodanie", () => {
        expect(describeMemberState({ email: "a@gmail.com", state: "INVITED" })).toMatch(/zaproszenie wysłane/);
        expect(describeMemberState({ email: "a@gmail.com", state: "INVITED" })).not.toMatch(/dodano/);
    });

    it("FAILED niesie powód", () => {
        expect(describeMemberState({ email: "a@x.pl", state: "FAILED", error: "brak konta" })).toBe(
            "nie udało się dodać: brak konta",
        );
    });
});

describe("_chatSpaceSelection w schemacie kontraktu ENVI", () => {
    async function errors(selection: unknown): Promise<string[]> {
        try {
            await ourContractValidationSchema(false).validate(
                { _chatSpaceSelection: selection },
                { abortEarly: false },
            );
            return [];
        } catch (err) {
            if (err instanceof Yup.ValidationError)
                return err.inner.filter((e) => e.path === "_chatSpaceSelection").map((e) => e.message);
            throw err;
        }
    }

    it("brak pola i tryb none przechodzą", async () => {
        expect(await errors(undefined)).toEqual([]);
        expect(await errors({ mode: "none" })).toEqual([]);
    });

    it("istniejący pokój wymaga wskazania pokoju", async () => {
        expect(await errors({ mode: "existing", chatSpaceId: 0 })).toEqual(["Wybierz pokój z listy"]);
        expect(await errors({ mode: "existing", chatSpaceId: 7 })).toEqual([]);
    });

    it("nazwa nowego pokoju max 128 znaków", async () => {
        expect(await errors({ mode: "new", scope: "project", displayName: "a".repeat(129) })).toHaveLength(1);
        expect(await errors({ mode: "new", scope: "contract" })).toEqual([]);
    });
});
