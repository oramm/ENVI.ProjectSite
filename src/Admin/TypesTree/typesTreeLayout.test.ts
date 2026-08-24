/**
 * typesTreeLayout - czysta funkcja układu, więc testowana bez renderowania.
 *
 * Pilnujemy tego, co HTY-2 mogło zepsuć po cichu: kafel sprawy rośnie o listę
 * zadań, ale drzewo NIE rośnie wszerz, a kafle nie wchodzą na siebie. Szerokość
 * jest tu ważniejsza od urody - to ona decyduje, czy widok mieści się na laptopie.
 */
import { describe, expect, it } from "vitest";
import { TypesTreeCaseType, TypesTreeData, TypesTreeMilestoneType } from "./typesTreeModel";
import { EMPTY_SUMMARY, LayoutNode, TreeDepth, caseNodeHeight, layout } from "./typesTreeLayout";

const NODE_H = 42;

const milestoneType = (id: number, name: string): TypesTreeMilestoneType => ({
    id,
    name,
    description: "",
    isUniquePerContract: false,
    isInScrumByDefault: false,
    _usageCount: 0,
    _isNameLocked: false,
    _templateId: id,
    _templateName: "",
    _templateDescription: "",
});

const caseType = (id: number, name: string, over: Partial<TypesTreeCaseType> = {}): TypesTreeCaseType => ({
    id,
    milestoneTypeId: 1,
    name,
    description: "",
    folderNumber: String(id).padStart(2, "0"),
    isDefault: false,
    isUniquePerMilestone: false,
    isInScrumByDefault: false,
    isSubCaseOnly: false,
    _usageCount: 0,
    _isNameLocked: false,
    _templateId: id,
    _templateName: "",
    _templateDescription: "",
    _taskTemplates: [],
    ...over,
});

const tasks = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        name: `Zadanie ${index + 1}`,
        description: "",
        status: index % 2 ? "Backlog" : "Nie rozpoczęty",
    }));

/** Jeden typ umowy, jeden kamień, trzy sprawy z 0 / 1 / 2 zadaniami. */
function makeData(): TypesTreeData {
    return {
        contractTypes: [{ id: 3, name: "Żółty", description: "", status: "ACTIVE", isOur: true }],
        milestoneTypes: [milestoneType(1, "Administracja")],
        contractTypeMilestoneTypes: [
            { contractTypeId: 3, milestoneTypeId: 1, folderNumber: "00", isDefault: true },
        ],
        offerMilestoneTypes: [],
        caseTypes: [
            caseType(11, "Umowa"),
            caseType(12, "Harmonogram", { _taskTemplates: tasks(1) }),
            caseType(13, "Ubezpieczenie", { _taskTemplates: tasks(2) }),
        ],
        subCaseTypeLinks: [],
    };
}

const byId = (nodes: LayoutNode[], id: string) => {
    const found = nodes.find((node) => node.id === id);
    if (!found) throw new Error(`Brak węzła ${id}`);
    return found;
};

/** Czy dwa kafle w tej samej kolumnie zachodzą na siebie w pionie. */
function overlaps(a: LayoutNode, b: LayoutNode) {
    if (a.x !== b.x) return false;
    return a.y < b.y + b.h && b.y < a.y + a.h;
}

describe("typesTreeLayout - zadania w kaflu sprawy", () => {
    it("wysokość kafla rośnie o listę zadań: 0 / 1 / 2", () => {
        const { nodes } = layout(makeData(), 3, { showTasks: true });
        expect(byId(nodes, "caseType:11").h).toBe(NODE_H);
        expect(byId(nodes, "caseType:12").h).toBe(caseNodeHeight(1, true));
        expect(byId(nodes, "caseType:13").h).toBe(caseNodeHeight(2, true));
        // Każde zadanie kosztuje tyle samo, a pierwsze dokłada jeszcze pasek nad listą.
        const jedno = byId(nodes, "caseType:12").h - NODE_H;
        const dwa = byId(nodes, "caseType:13").h - NODE_H;
        expect(dwa - jedno).toBe(jedno - 4);
    });

    it("wyłączony przełącznik zwija kafle do wysokości sprzed zmiany, licznik zostaje", () => {
        const { nodes, height } = layout(makeData(), 3, { showTasks: false });
        nodes.forEach((node) => expect(node.h).toBe(NODE_H));
        expect(byId(nodes, "caseType:13").taskCount).toBe(2);
        expect(byId(nodes, "caseType:13").tasks).toBeUndefined();
        expect(height).toBe(layout(makeData(), 3, { showTasks: true }).height - 3 * 20 - 2 * 4);
    });

    it("szerokość płótna jest identyczna z zadaniami i bez nich", () => {
        const zZadaniami = layout(makeData(), 3, { showTasks: true });
        const bezZadan = layout(makeData(), 3, { showTasks: false });
        expect(zZadaniami.width).toBe(bezZadan.width);
        // Kolumny też stoją w tych samych miejscach - rośnie wyłącznie pion.
        zZadaniami.nodes.forEach((node) => expect(node.x).toBe(byId(bezZadan.nodes, node.id).x));
    });

    it("żadne dwa kafle w kolumnie nie zachodzą na siebie", () => {
        const { nodes } = layout(makeData(), 3, { showTasks: true });
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                expect(overlaps(nodes[i], nodes[j])).toBe(false);
            }
        }
    });

    it("kamień stoi w połowie NAGŁÓWKÓW spraw, a nie w połowie ich list zadań", () => {
        const { nodes } = layout(makeData(), 3, { showTasks: true });
        const kamien = byId(nodes, "milestoneType:1");
        const pierwsza = byId(nodes, "caseType:11");
        const ostatnia = byId(nodes, "caseType:13");
        expect(kamien.anchorY).toBe((pierwsza.anchorY + ostatnia.anchorY) / 2);
    });

    it("podsprawa też pokazuje swoje zadania - żadna rola ich nie chowa po cichu", () => {
        const data = makeData();
        data.caseTypes.push(caseType(21, "Odcinek", { isSubCaseOnly: true, _taskTemplates: tasks(2) }));
        data.subCaseTypeLinks.push({ parentCaseTypeId: 11, subCaseTypeId: 21 });
        const { nodes } = layout(data, 3, { showTasks: true });
        const podsprawa = byId(nodes, "subCaseType:21");
        expect(podsprawa.tasks).toHaveLength(2);
        expect(podsprawa.h).toBe(caseNodeHeight(2, true));
    });

    it("wysokość rośnie dokładnie o sumę list zadań, nic więcej", () => {
        const bez = layout(makeData(), 3, { showTasks: false });
        const z = layout(makeData(), 3, { showTasks: true });
        const przyrost = z.nodes.reduce(
            (sum, node) => sum + caseNodeHeight(node.taskCount ?? 0, true) - NODE_H,
            0,
        );
        expect(z.height - bez.height).toBe(przyrost);
    });
});

/**
 * Ten sam typ podsprawy dopuszczony pod DWOMA rodzicami - przypadek, dla którego
 * układ ma dwa przebiegi, i jedyny, w którym zwinięcie jednej gałęzi nie może
 * zabrać węzła drugiej.
 */
function makeSharedData(): TypesTreeData {
    const data = makeData();
    data.caseTypes.push(caseType(21, "Odcinek", { isSubCaseOnly: true }));
    data.subCaseTypeLinks.push({ parentCaseTypeId: 11, subCaseTypeId: 21 });
    data.subCaseTypeLinks.push({ parentCaseTypeId: 12, subCaseTypeId: 21 });
    return data;
}

const idsOfKind = (nodes: LayoutNode[], kind: string) =>
    nodes.filter((node) => node.kind === kind).map((node) => node.id);

describe("typesTreeLayout - zwijanie poziomów i gałęzi", () => {
    it("poziom kamieni zostawia same kamienie, a płótno zwęża się do ich kolumny", () => {
        const pelne = layout(makeSharedData(), 3, { depth: "subCases" });
        const { nodes, width } = layout(makeSharedData(), 3, { depth: "milestones" });
        expect(idsOfKind(nodes, "caseType")).toEqual([]);
        expect(idsOfKind(nodes, "subCaseType")).toEqual([]);
        expect(idsOfKind(nodes, "milestoneType")).toEqual(["milestoneType:1"]);
        // Kolumna spraw przestała istnieć, więc nie rezerwuje pasa po prawej.
        expect(width).toBeLessThan(pelne.width);
        expect(width).toBe(Math.max(...nodes.map((node) => node.x + node.w)) + 20);
    });

    it("poziom spraw chowa podsprawy, ale zostawia zadania w kaflach", () => {
        const { nodes } = layout(makeSharedData(), 3, { depth: "cases", showTasks: true });
        expect(idsOfKind(nodes, "subCaseType")).toEqual([]);
        expect(byId(nodes, "caseType:13").tasks).toHaveLength(2);
    });

    it("zwinięty kafel ZAWSZE niesie licznik ukrytych dzieci", () => {
        const depths: TreeDepth[] = ["milestones", "cases", "subCases"];
        depths.forEach((depth) => {
            const { nodes } = layout(makeSharedData(), 3, { depth });
            nodes
                .filter((node) => node.canCollapse && !node.isExpanded)
                .forEach((node) => expect(node.hiddenCount ?? 0).toBeGreaterThan(0));
        });
    });

    it("licznik podaje liczbę dzieci, nie liczbę wnuków", () => {
        const { nodes } = layout(makeSharedData(), 3, { depth: "milestones" });
        const kamien = byId(nodes, "milestoneType:1");
        expect(kamien.hiddenCount).toBe(3);
        expect(kamien.hiddenLabel).toBe("Ukryte: 3 typy spraw");
    });

    it("chevron zwija gałąź, którą poziom pokazuje", () => {
        const { nodes } = layout(makeSharedData(), 3, {
            depth: "subCases",
            expanded: { "milestoneType:1": false },
        });
        expect(idsOfKind(nodes, "caseType")).toEqual([]);
        expect(byId(nodes, "milestoneType:1").hiddenCount).toBe(3);
    });

    it("chevron rozwija gałąź, którą poziom chowa - jedna gałąź do dna", () => {
        const { nodes } = layout(makeSharedData(), 3, {
            depth: "milestones",
            expanded: { "milestoneType:1": true, "caseType:11": true },
        });
        expect(idsOfKind(nodes, "caseType")).toHaveLength(3);
        // Rozwinięta jest wyłącznie ta jedna sprawa; sąsiednie dalej liczą ukryte.
        expect(idsOfKind(nodes, "subCaseType")).toEqual(["subCaseType:21"]);
        expect(byId(nodes, "caseType:12").hiddenCount).toBe(1);
        expect(byId(nodes, "caseType:11").hiddenCount).toBeUndefined();
    });

    it("podsprawa dzielona zostaje, dopóki choć jeden rodzic jest rozwinięty", () => {
        const { nodes, edges } = layout(makeSharedData(), 3, {
            depth: "subCases",
            expanded: { "caseType:11": false },
        });
        expect(idsOfKind(nodes, "subCaseType")).toEqual(["subCaseType:21"]);
        // Linia zostaje tylko od rodzica, który ją pokazuje.
        const doPodsprawy = edges.filter((edge) => edge.toId === "subCaseType:21");
        expect(doPodsprawy.map((edge) => edge.fromId)).toEqual(["caseType:12"]);
        // Zwinięty rodzic policzył ją u siebie - nie znika bez śladu.
        expect(byId(nodes, "caseType:11").hiddenCount).toBe(1);
    });

    it("zwinięcie wszystkich rodziców chowa podsprawę, a licznik zostaje u każdego", () => {
        const { nodes } = layout(makeSharedData(), 3, {
            depth: "subCases",
            expanded: { "caseType:11": false, "caseType:12": false },
        });
        expect(idsOfKind(nodes, "subCaseType")).toEqual([]);
        expect(byId(nodes, "caseType:11").hiddenCount).toBe(1);
        expect(byId(nodes, "caseType:12").hiddenCount).toBe(1);
    });

    it("podsumowanie mówi, ile z czego widać przy ilu istniejących", () => {
        const { summary } = layout(makeSharedData(), 3, { depth: "milestones" });
        expect(summary.milestoneTypes).toEqual({ visible: 1, total: 1 });
        expect(summary.caseTypes).toEqual({ visible: 0, total: 3 });
        expect(summary.subCaseTypes).toEqual({ visible: 0, total: 1 });
        // Trzy zadania są w danych, mimo że żadnego nie widać - i tak to trzeba powiedzieć.
        expect(summary.tasks).toEqual({ visible: 0, total: 3 });
    });

    it("kolumny liczą się od nowa, a nie przez odjęcie stałej wysokości kafla", () => {
        const chude = makeSharedData();
        const grube = makeSharedData();
        // Ta sama struktura, dziesięć razy więcej zadań w ukrytych kaflach spraw.
        grube.caseTypes[2]._taskTemplates = tasks(20);
        const a = layout(chude, 3, { depth: "milestones" });
        const b = layout(grube, 3, { depth: "milestones" });
        expect(b.height).toBe(a.height);
        expect(b.width).toBe(a.width);
    });

    it("żadne dwa kafle nie zachodzą na siebie przy żadnej głębokości", () => {
        const depths: TreeDepth[] = ["milestones", "cases", "subCases"];
        depths.forEach((depth) => {
            const { nodes } = layout(makeSharedData(), 3, { depth });
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    expect(overlaps(nodes[i], nodes[j])).toBe(false);
                }
            }
        });
    });

    it("bez opcji drzewo jest rozwinięte do dna - stan wyjściowy nie chowa niczego", () => {
        const domyslny = layout(makeSharedData(), 3);
        const jawny = layout(makeSharedData(), 3, { depth: "subCases", expanded: {} });
        expect(domyslny.width).toBe(jawny.width);
        expect(domyslny.height).toBe(jawny.height);
        expect(domyslny.nodes.every((node) => (node.hiddenCount ?? 0) === 0)).toBe(true);
    });
});

/**
 * HTY-4: kolumna zerowa z typami umów (A4) i typy wycofane (E2).
 *
 * Trzy rzeczy, które ta kolumna może zepsuć po cichu: rozjechać wybrany typ z jego
 * gałęzią, zostawić w liście dziurę udającą brak danych i wypchnąć kafle nad płótno,
 * gdzie nikt ich nie zobaczy. Każda ma tu swój test.
 */
const contractType = (
    id: number,
    name: string,
    status = "ACTIVE",
): TypesTreeData["contractTypes"][number] => ({ id, name, description: "", status, isOur: true });

/** Cztery typy umów; wybierany „Żółty" (id 3) stoi trzeci, wycofany (id 14) - czwarty. */
function makeManyContractTypes(): TypesTreeData {
    const data = makeData();
    data.contractTypes = [
        contractType(1, "AGL"),
        contractType(2, "Dostawy"),
        contractType(3, "Żółty"),
        contractType(14, "Czerwony ryczałtowy", "OLD"),
    ];
    // Ten sam kamień wisi też pod AGL - licznik nierozwiniętego typu ma go policzyć.
    data.contractTypeMilestoneTypes.push({
        contractTypeId: 1,
        milestoneTypeId: 1,
        folderNumber: "00",
        isDefault: false,
    });
    return data;
}

/** Krótka gałąź (jeden kamień, jedna sprawa) przy typie stojącym na końcu listy. */
function makeShortBranch(): TypesTreeData {
    const data = makeManyContractTypes();
    data.caseTypes = [caseType(11, "Umowa")];
    data.contractTypes = [
        contractType(1, "AGL"),
        contractType(2, "Dostawy"),
        contractType(4, "SIWZ"),
        contractType(3, "Żółty"),
    ];
    return data;
}

const contractColumn = (nodes: LayoutNode[]) => nodes.filter((node) => node.kind === "contractType");

describe("typesTreeLayout - typy umów jako kolumna zerowa", () => {
    it("kolumna niesie WSZYSTKIE typy umów, w kolejności z danych", () => {
        const { nodes } = layout(makeManyContractTypes(), 3);
        expect(contractColumn(nodes).map((node) => node.entityId)).toEqual([1, 2, 3, 14]);
    });

    it("wybrany typ stoi naprzeciwko środka swojej gałęzi", () => {
        const { nodes } = layout(makeManyContractTypes(), 3);
        expect(byId(nodes, "contractType:3").anchorY).toBe(byId(nodes, "milestoneType:1").anchorY);
    });

    it("odstęp jest jednakowy w całej kolumnie - także wokół wybranego typu", () => {
        const kolumna = contractColumn(layout(makeManyContractTypes(), 3).nodes);
        const odstepy = kolumna.slice(1).map((node, index) => node.y - kolumna[index].y);
        // Przerwa w kolumnie czytałaby się jako „tu czegoś brakuje".
        expect(new Set(odstepy).size).toBe(1);
        expect(odstepy[0]).toBe(NODE_H + 10);
    });

    it("kolumna zerowa nie zmienia szerokości płótna", () => {
        // Kolumna typu umowy stała tam już wcześniej - jako pojedynczy kafel.
        // Trzynaście kafli zamiast jednego to zmiana wysokości, nie szerokości.
        expect(layout(makeManyContractTypes(), 3).width).toBe(layout(makeData(), 3).width);
    });

    it("krótka gałąź: całość zjeżdża w dół, nic nie wychodzi nad płótno", () => {
        const { nodes } = layout(makeShortBranch(), 3);
        const kolumna = contractColumn(nodes);
        expect(Math.min(...kolumna.map((node) => node.y))).toBe(20);
        // Przesuwa się CAŁOŚĆ, nie sama kolumna - wybrany typ dalej stoi
        // naprzeciwko swojej gałęzi, a gałąź zjechała razem z nim.
        expect(byId(nodes, "contractType:3").anchorY).toBe(byId(nodes, "milestoneType:1").anchorY);
        expect(byId(nodes, "milestoneType:1").y).toBeGreaterThan(20);
        expect(byId(nodes, "caseType:11").y).toBeGreaterThan(20);
    });

    it("nierozwinięty typ jest przygaszony i niesie licznik kamieni", () => {
        const { nodes } = layout(makeManyContractTypes(), 3);
        const agl = byId(nodes, "contractType:1");
        expect(agl.isDimmed).toBe(true);
        expect(agl.hiddenCount).toBe(1);
        expect(agl.hiddenLabel).toBe("Ukryte: 1 typ kamienia");
        const wybrany = byId(nodes, "contractType:3");
        expect(wybrany.isDimmed).toBe(false);
        expect(wybrany.hiddenCount).toBeUndefined();
        // Typ bez kamieni nie udaje, że coś chowa.
        expect(byId(nodes, "contractType:14").hiddenCount).toBeUndefined();
    });

    it("typ ze statusem OLD jest oznaczony jako wycofany, i tylko on", () => {
        const { nodes } = layout(makeManyContractTypes(), 3);
        expect(byId(nodes, "contractType:14").isRetired).toBe(true);
        expect(byId(nodes, "contractType:3").isRetired).toBe(false);
    });

    it("typ bez kamieni dostaje kafel pustej gałęzi, a nie puste płótno", () => {
        const { nodes, edges } = layout(makeManyContractTypes(), 14);
        const puste = nodes.filter((node) => node.kind === "emptyBranch");
        expect(puste).toHaveLength(1);
        expect(puste[0].label).toBe("brak przypisanych kamieni");
        // Kafel wisi na linii od swojego typu - inaczej wyglądałby na zgubiony.
        expect(edges).toEqual([{ fromId: "contractType:14", toId: puste[0].id }]);
        // Lista typów zostaje w komplecie, żeby dało się wyjść z pustej gałęzi.
        expect(contractColumn(nodes)).toHaveLength(4);
        expect(byId(nodes, "contractType:14").anchorY).toBe(puste[0].anchorY);
    });

    it("żadne dwa kafle nie zachodzą na siebie przy żadnej głębokości", () => {
        const depths: TreeDepth[] = ["milestones", "cases", "subCases"];
        [3, 14].forEach((selected) => {
            depths.forEach((depth) => {
                const { nodes } = layout(makeManyContractTypes(), selected, { depth });
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        expect(overlaps(nodes[i], nodes[j])).toBe(false);
                    }
                }
            });
        });
    });

    it("podsumowanie wymienia kolumnę typów umów", () => {
        // Zdanie nad drzewem, które przemilcza kolumnę zajmującą jedną czwartą
        // szerokości, opisuje inny obraz niż ten na ekranie.
        expect(layout(makeManyContractTypes(), 3).summary.contractTypes).toEqual({ visible: 4, total: 4 });
    });

    it("brak wybranego typu zostaje pustym układem - kolumna nie rysuje się sama", () => {
        const pusty = layout(makeManyContractTypes(), null);
        expect(pusty.nodes).toEqual([]);
        expect(pusty.summary).toBe(EMPTY_SUMMARY);
    });
});
