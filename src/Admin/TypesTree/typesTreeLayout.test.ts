/**
 * typesTreeLayout - czysta funkcja układu, więc testowana bez renderowania.
 *
 * Pilnujemy tego, co HTY-2 mogło zepsuć po cichu: kafel sprawy rośnie o listę
 * zadań, ale drzewo NIE rośnie wszerz, a kafle nie wchodzą na siebie. Szerokość
 * jest tu ważniejsza od urody - to ona decyduje, czy widok mieści się na laptopie.
 */
import { describe, expect, it } from "vitest";
import { TypesTreeCaseType, TypesTreeData, TypesTreeMilestoneType } from "./typesTreeModel";
import { LayoutNode, caseNodeHeight, layout } from "./typesTreeLayout";

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
