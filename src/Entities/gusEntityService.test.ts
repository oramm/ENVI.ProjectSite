/**
 * GUS-4b — pętla przebiegu po `remaining`.
 *
 * To jest jedyny kawałek logiki tego checkpointu, którego nie widać na ekranie:
 * ekran woła trasę partia po partii i sam decyduje, kiedy przestać. Zły warunek
 * końca znaczy albo niedokończony przebieg, albo nieskończone odpytywanie rejestru
 * GUS — a limit rejestru liczy się per klucz i jest wspólny z FIDmanem (pułapka P-4).
 */
import { describe, expect, it, vi } from "vitest";
import { GUS_SWEEP_MAX_PASSES, GusSweepSummary, runGusSweepLoop } from "./gusEntityService";

function batch(partial: Partial<GusSweepSummary>): GusSweepSummary {
    return { checked: 0, byStatus: {}, remaining: 0, aborted: false, ...partial };
}

describe("runGusSweepLoop", () => {
    it("woła partie, aż remaining spadnie do zera, i sumuje liczniki", async () => {
        const runBatch = vi
            .fn()
            .mockResolvedValueOnce(batch({ checked: 20, remaining: 25, byStatus: { OK: 12, DIFF: 8 } }))
            .mockResolvedValueOnce(batch({ checked: 20, remaining: 5, byStatus: { OK: 5, DIFF: 15 } }))
            .mockResolvedValueOnce(batch({ checked: 5, remaining: 0, byStatus: { OK: 3, DIFF_MINOR: 2 } }));

        const seen: number[] = [];
        const result = await runGusSweepLoop((progress) => seen.push(progress.remaining), runBatch);

        expect(runBatch).toHaveBeenCalledTimes(3);
        expect(result.passes).toBe(3);
        expect(result.checked).toBe(45);
        expect(result.remaining).toBe(0);
        expect(result.byStatus).toEqual({ OK: 20, DIFF: 23, DIFF_MINOR: 2 });
        expect(result.aborted).toBe(false);
        // Mianownik paska postępu bierze się z pierwszej partii: sprawdzone + zostało.
        expect(result.total).toBe(45);
        expect(seen).toEqual([25, 5, 0]);
    });

    it("przerywa, gdy partia nie ruszyła ani jednego podmiotu mimo niezerowej kolejki", async () => {
        // Bez tego warunku rekord, którego z jakiegokolwiek powodu nie da się odhaczyć,
        // kręciłby pętlę w kółko i wysyłał zapytania do rejestru bez końca.
        const runBatch = vi
            .fn()
            .mockResolvedValueOnce(batch({ checked: 10, remaining: 7 }))
            .mockResolvedValueOnce(batch({ checked: 0, remaining: 7 }));

        const result = await runGusSweepLoop(() => undefined, runBatch);

        expect(runBatch).toHaveBeenCalledTimes(2);
        expect(result.remaining).toBe(7);
        expect(result.checked).toBe(10);
    });

    it("kończy natychmiast, gdy serwer zgłosi przerwanie partii", async () => {
        const runBatch = vi.fn().mockResolvedValue(
            batch({ checked: 3, remaining: 99, aborted: true, abortReason: "Przerwano po zaporze serwera" })
        );

        const result = await runGusSweepLoop(() => undefined, runBatch);

        expect(runBatch).toHaveBeenCalledTimes(1);
        expect(result.aborted).toBe(true);
        expect(result.abortReason).toBe("Przerwano po zaporze serwera");
    });

    it("zapora zatrzymuje pętlę, gdy remaining nie chce spaść", async () => {
        // Kontrola negatywna wpisana w test: serwer, który zawsze melduje „coś jeszcze zostało",
        // nie ma prawa zamienić otwartej karty w nieskończone odpytywanie rejestru.
        const runBatch = vi.fn().mockResolvedValue(batch({ checked: 1, remaining: 500 }));

        const result = await runGusSweepLoop(() => undefined, runBatch);

        expect(runBatch).toHaveBeenCalledTimes(GUS_SWEEP_MAX_PASSES);
        expect(result.aborted).toBe(true);
        expect(result.abortReason).toContain("500");
    });
});
