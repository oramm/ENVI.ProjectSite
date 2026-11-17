/** Calendar date for office records, independent of the browser's timezone. */
export function warsawDate(now: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(now);
    const part = (name: string) => parts.find((p) => p.type === name)!.value;
    return `${part("year")}-${part("month")}-${part("day")}`;
}
