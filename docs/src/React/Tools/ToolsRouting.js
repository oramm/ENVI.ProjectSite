"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDetailsPath = void 0;
function buildDetailsPath(routeBase, id) {
    let normalized = routeBase.trim();
    if (!normalized)
        return "";
    if (!normalized.startsWith("/"))
        normalized = "/" + normalized;
    if (!normalized.endsWith("/"))
        normalized = normalized + "/";
    return `${normalized}${id}`;
}
exports.buildDetailsPath = buildDetailsPath;
