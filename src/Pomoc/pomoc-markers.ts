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
        const element = document.querySelector(`[data-pomoc="${id}"]`);
        return !!element?.getClientRects().length;
    }).map(([id, label]) => ({ id, label }));
}

export function highlightPomocMarker(id: string) {
    clearPomocHighlight();
    if (!Object.prototype.hasOwnProperty.call(POMOC_MARKERS, id)) return;
    const element = document.querySelector<HTMLElement>(`[data-pomoc="${id}"]`);
    if (!element?.getClientRects().length) return;
    element.classList.add('pomoc-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
