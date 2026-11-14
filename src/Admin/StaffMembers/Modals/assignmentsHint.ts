import MainSetup from "../../../React/MainSetupReact";

/** Co daje przypisanie w danym kręgu - teksty z zatwierdzonej makiety DOSTEP-6. */
export function assignmentsHint(systemRoleId: unknown): string {
    const role = Object.values(MainSetup.SystemRoles).find((r) => r.id === Number(systemRoleId))?.systemName;
    if (role && MainSetup.STAFF_ROLES.includes(role))
        return "Dla pracownika ENVI przypisanie porządkuje: wyznacza jego pocztę i pokoje czatu. Dane projektów widzi i bez niego.";
    if (role && MainSetup.NO_PROJECT_MAIL_ROLES.includes(role))
        return "Ta osoba widzi wyłącznie dane wskazanych projektów, bez poczty i pokoju czatu. Odebranie przypisania zabiera wszystko.";
    return "Ta osoba widzi wyłącznie dane wskazanych projektów. Jedno przypisanie daje jej dane, pisma, dokumenty, pocztę i pokój czatu; odebranie je zabiera (pocztę i pokój zostawia tylko rola w kontrakcie tego projektu).";
}
