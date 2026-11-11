export const POMOC_MARKERS: Record<string, string> = {
    'contract-add': 'Rejestruj umowę ENVI',
    'case-add': 'Dodaj sprawę',
    'letter-add': 'Rejestruj pismo wychodzące',
};

export function clearPomocHighlight() {
    document.querySelectorAll('.pomoc-highlight').forEach((element) => element.classList.remove('pomoc-highlight'));
}

export function visiblePomocMarkers() {
    return Object.entries(POMOC_MARKERS).filter(([id]) => {
        return Array.from(document.querySelectorAll(`[data-pomoc="${id}"]`)).some((element) => element.getClientRects().length > 0);
    }).map(([id, label]) => ({ id, label }));
}

export function highlightPomocMarker(id: string) {
    clearPomocHighlight();
    if (!Object.prototype.hasOwnProperty.call(POMOC_MARKERS, id)) return;
    const element = Array.from(document.querySelectorAll<HTMLElement>(`[data-pomoc="${id}"]`)).find((element) => element.getClientRects().length > 0);
    if (!element) return;
    element.classList.add('pomoc-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
