import { AbsenceTypeData } from "../../../Typings/bussinesTypes";

/**
 * Pula, z której schodzi typ nieobecności.
 *
 * Trzy flagi w bazie są ROZŁĄCZNE - kontroler urlopów sprawdza dostępne dni względem
 * jednej puli, a salda roczne sumują każdą flagę osobno, więc typ z dwiema flagami
 * zjadałby dwie pule naraz. Backend odrzuca taki payload, a UI nie daje go nawet złożyć:
 * zamiast trzech niezależnych przełączników jest jeden wybór.
 */
export const ABSENCE_POOLS = [
    { value: "limit", label: "Limit urlopu" },
    { value: "care", label: "Pula opieki" },
    { value: "holiday", label: "Pula wolnego za święta" },
    { value: "none", label: "Żadna - nie zmniejsza żadnej puli" },
] as const;

export type AbsencePool = (typeof ABSENCE_POOLS)[number]["value"];

/** Kolejność jak w kontrolerze urlopów (assertTypeWithinPool): opieka, za święta, limit. */
export function readPool(type: Partial<AbsenceTypeData>): AbsencePool {
    if (type.countsAsCare) return "care";
    if (type.countsAsHoliday) return "holiday";
    if (type.countsAgainstLimit) return "limit";
    return "none";
}

/** Wybór z listy → trzy flagi payloadu. Z definicji najwyżej jedna jest prawdziwa. */
export function poolFlags(pool: AbsencePool) {
    return {
        countsAgainstLimit: pool === "limit",
        countsAsCare: pool === "care",
        countsAsHoliday: pool === "holiday",
    };
}

export function poolLabel(type: Partial<AbsenceTypeData>): string {
    const pool = readPool(type);
    return ABSENCE_POOLS.find((p) => p.value === pool)!.label;
}
