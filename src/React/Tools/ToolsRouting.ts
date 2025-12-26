export function buildDetailsPath(routeBase: string, id: number | string): string {
    let normalized = routeBase.trim();
    if (!normalized) return "";
    if (!normalized.startsWith("/")) normalized = "/" + normalized;
    if (!normalized.endsWith("/")) normalized = normalized + "/";
    return `${normalized}${id}`;
}
