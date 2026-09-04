import { describe, expect, it } from "vitest";
import { makeStaffMembersBridgeCriteria, seedStaffMembersFilter, STAFF_MEMBERS_SNAPSHOT_KEY } from "./StaffMembersSearch";

/**
 * Drugi koniec pomostu z okna „Osoby” (PER-4, przebudowany w PER-7 wg D-PER-9, rozszerzony
 * w PER-8 o rolę i podmiot): okno uprawnień wpisuje wskazaną osobę do formularza filtra
 * zamiast nakładać ukryty warunek.
 *
 * Testowana jest reguła i zasiew migawki, nie render okna: `StaffMembersSearch` ciągnie
 * za sobą repozytoria i żądania do serwera, a stawką jest to, CO poleci do serwera.
 */
class FakeStorage implements Storage {
    private items = new Map<string, string>();
    get length() {
        return this.items.size;
    }
    clear() {
        this.items.clear();
    }
    getItem(key: string) {
        return this.items.get(key) ?? null;
    }
    key(index: number) {
        return [...this.items.keys()][index] ?? null;
    }
    removeItem(key: string) {
        this.items.delete(key);
    }
    setItem(key: string, value: string) {
        this.items.set(key, value);
    }
}

const full = { fraza: "Jan Kowalski", rola: "3", podmiot: "1", podmiotNazwa: "ENVI" };

describe("makeStaffMembersBridgeCriteria", () => {
    it("fraza, rola i podmiot idą do filtra z zakresem „Wszystkie osoby”", () => {
        // „all”, bo osoba bez konta i bez uprawnień nie mieści się w węższych zakresach,
        // a to jej najczęściej nadaje się uprawnienia po raz pierwszy. Rola i podmiot
        // odróżniają imienników i nazwiska zawierające imię (PER-8).
        expect(makeStaffMembersBridgeCriteria(full)).toEqual({
            searchText: "Jan Kowalski",
            scope: "all",
            systemRoleId: "3",
            _entities: [{ id: 1, name: "ENVI" }],
        });
    });

    it("bez roli i podmiotu pola są jawnie puste, nie brakujące", () => {
        expect(makeStaffMembersBridgeCriteria({ fraza: "  Jan Kowalski " })).toEqual({
            searchText: "Jan Kowalski",
            scope: "all",
            systemRoleId: "",
            _entities: [],
        });
    });

    it("śmieć w roli albo podmiocie nie zawęża listy", () => {
        const criteria = makeStaffMembersBridgeCriteria({ ...full, rola: "abc", podmiot: "-2" });
        expect(criteria?.systemRoleId).toBe("");
        expect(criteria?._entities).toEqual([]);
    });

    it("brak frazy, pusta albo same spacje = brak pomostu, choćby rola i podmiot były", () => {
        for (const fraza of [null, "", "   "]) expect(makeStaffMembersBridgeCriteria({ ...full, fraza })).toBeNull();
    });
});

describe("seedStaffMembersFilter", () => {
    it("nadpisuje zapamiętane wyszukiwanie w całości - stara fraza nie może dodać się do nowej", () => {
        // Właśnie ta nakładka dała ownerowi 0 wierszy: „test” z poprzedniej wizyty
        // plus inna osoba z pomostu.
        const storage = new FakeStorage();
        storage.setItem(
            STAFF_MEMBERS_SNAPSHOT_KEY,
            JSON.stringify({ criteria: { searchText: "test", systemRoleId: "5", scope: "permissions" }, storedObjects: [{ id: 1 }] }),
        );

        expect(seedStaffMembersFilter(full, storage)).toBe(true);

        const snapshot = JSON.parse(storage.getItem(STAFF_MEMBERS_SNAPSHOT_KEY) as string);
        expect(snapshot.criteria).toEqual({
            searchText: "Jan Kowalski",
            scope: "all",
            systemRoleId: "3",
            _entities: [{ id: 1, name: "ENVI" }],
        });
        expect(snapshot.storedObjects).toBeUndefined();
    });

    it("bez frazy nie rusza migawki - wejście z menu zachowuje ostatnie wyszukiwanie", () => {
        const storage = new FakeStorage();
        storage.setItem(STAFF_MEMBERS_SNAPSHOT_KEY, JSON.stringify({ criteria: { searchText: "test" } }));

        expect(seedStaffMembersFilter({ fraza: null }, storage)).toBe(false);

        expect(JSON.parse(storage.getItem(STAFF_MEMBERS_SNAPSHOT_KEY) as string).criteria).toEqual({ searchText: "test" });
    });
});
