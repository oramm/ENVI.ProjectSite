import { afterEach, beforeEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PomocButton, PomocDrawer } from "@envi/agent-panel";
import Pomoc from "./Pomoc";
import MainSetup from "../React/MainSetupReact";
import { clearPomocHighlight, highlightPomocMarker, visiblePomocMarkers, POMOC_MARKERS } from "./pomoc-markers";
import { readFileSync } from "node:fs";

const fetchMock = vi.fn();
const originalUrl = MainSetup.serverUrl;
beforeEach(() => {
    MainSetup.serverUrl = 'http://localhost:3000/';
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => ({ available: true, version: 'wersja-testowa' }) });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); MainSetup.serverUrl = originalUrl; clearPomocHighlight(); });
const renderPomoc = () => render(<MemoryRouter><Pomoc /></MemoryRouter>);

test('paczka e198e20 renderuje przycisk i szufladę na React 18 oraz obsługuje formularz', () => {
    expect(React.version).toMatch(/^18\./);
    const ask = vi.fn();
    const { unmount } = render(<><PomocButton open={true} /><PomocDrawer model={{ system: 'PS ENVI', systemLocative: 'PS ENVI', systemAccusative: 'PS ENVI', version: 'test', messages: [], busy: false }} onAsk={ask} /></>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Jak dodać sprawę?' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    expect(ask).toHaveBeenCalledWith('Jak dodać sprawę?');
    expect(document.body.style.getPropertyValue('--envi-pomoc-drawer-width')).not.toBe('');
    unmount();
    expect(document.body.style.getPropertyValue('--envi-pomoc-drawer-width')).toBe('');
});
test.each([false, undefined])('available=%s ukrywa przycisk i nie przejmuje F1', async (available) => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ available }) });
    renderPomoc();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const event = new KeyboardEvent('keydown', { key: 'F1', cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole('button', { name: 'Pomoc' })).toBeNull();
});
test('błąd dostępności ukrywa przycisk', async () => {
    fetchMock.mockRejectedValue(new Error('atrapa sieci'));
    renderPomoc();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('button', { name: 'Pomoc' })).toBeNull();
});
test('available pokazuje przycisk, F1 otwiera panel, Escape oddaje fokus', async () => {
    renderPomoc();
    const button = await screen.findByRole('button', { name: 'Pomoc' });
    expect(document.body.style.getPropertyValue('--envi-pomoc-drawer-width')).toBe('');
    expect(fetchMock.mock.calls[0]).toEqual(['http://localhost:3000/pomoc/available', { credentials: 'include' }]);
    fireEvent.keyDown(window, { key: 'F1' });
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(document.body.style.getPropertyValue('--envi-pomoc-drawer-width')).not.toBe('');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(document.body.style.getPropertyValue('--envi-pomoc-drawer-width')).toBe('');
    expect(button).toHaveFocus();
});
test('nie przejmuje F1 aktywnemu modalowi', async () => {
    const { container } = renderPomoc();
    await screen.findByRole('button', { name: 'Pomoc' });
    container.insertAdjacentHTML('beforeend', '<div class="modal show"></div>');
    fireEvent.keyDown(window, { key: 'F1' });
    expect(screen.queryByRole('textbox')).toBeNull();
});
test('wysyła kontekst z ciasteczkiem, renderuje odpowiedź z wersją i kopiuje szkic', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    fetchMock.mockImplementation(async (url: string) => ({ ok: true, json: async () => url.endsWith('/available') ? { available: true, version: 'serwer abc1234, ekran def5678' } : url.endsWith('/ask') ? { taskId: 'zadanie-testowe', status: 'processing' } : { status: 'done', result: {
        decision: 'allowed', text: 'Wybierz Dodaj sprawę.', conversation: [], markers: [], ticket_draft: { title: 'Szkic', description: 'Opis problemu' },
    } } }));
    renderPomoc();
    fireEvent.click(await screen.findByRole('button', { name: 'Pomoc' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Jak dodać sprawę?' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    expect(await screen.findByText('Wybierz Dodaj sprawę.')).toBeVisible();
    expect(screen.getByText('Na podstawie PS ENVI serwer abc1234, ekran def5678')).toBeVisible();
    const call = fetchMock.mock.calls.find(([url]) => url.endsWith('/ask'))!;
    expect(call[1].credentials).toBe('include');
    expect(JSON.parse(call[1].body)).toMatchObject({ question: 'Jak dodać sprawę?', history: [], screen: { path: '/' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Zgłoś problem' })[0]);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Opis problemu')));
    expect(await screen.findByRole('status')).toHaveTextContent('skopiowano');
});

test('odmowa wyjaśnia kopiowanie szkicu do schowka zamiast obiecywać zakładkę', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    fetchMock.mockImplementation(async (url: string) => ({ ok: true, json: async () => url.endsWith('/available') ? { available: true, version: 'test' } : url.endsWith('/ask') ? { taskId: 'odmowa' } : { status: 'done', result: {
        decision: 'denied', reason: 'Limit pytań.', text: '', conversation: [], markers: [], ticket_draft: null,
    } } }));
    renderPomoc();
    fireEvent.click(await screen.findByRole('button', { name: 'Pomoc' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Jak dodać sprawę?' } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    expect(await screen.findByText(/Skopiuję opis do schowka — wklej go w wiadomości do administratora\./)).toBeVisible();
    expect(screen.queryByText(/Zgłoszenie trafi do zakładki/)).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: 'Zgłoś problem' })[0]);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Limit pytań.')));
});

test('powielony znacznik wysyła i podświetla widoczny przycisk, choć pierwszy jest ukryty', () => {
    render(<><button data-pomoc="case-add" hidden>Ukryty</button><button data-pomoc="case-add">Widoczny</button></>);
    const visible = screen.getByText('Widoczny');
    vi.spyOn(visible, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    visible.scrollIntoView = vi.fn();
    expect(visiblePomocMarkers()).toEqual([{ id: 'case-add', label: POMOC_MARKERS['case-add'] }]);
    highlightPomocMarker('case-add');
    expect(visible).toHaveClass('pomoc-highlight');
    expect(screen.getByText('Ukryty')).not.toHaveClass('pomoc-highlight');
    expect(visible.scrollIntoView).toHaveBeenCalled();
});
test('katalog i znaczniki wskazują rzeczywiste przyciski, niewidoczne nie są wysyłane', () => {
    const sourceFiles = [
        ['src/Contracts/ContractsList/Modals/ContractModalButtons.tsx', 'contract-add'],
        ['src/TasksGlobal/Modals/Case/CaseModalButtons.tsx', 'case-add'],
        ['src/Letters/LettersList/Modals/LetterModalButtons.tsx', 'letter-add'],
    ];
    for (const [file, id] of sourceFiles) expect(readFileSync(file, 'utf8')).toContain(`"data-pomoc": "${id}"`);
    const { container } = render(<><button data-pomoc="case-add">Dodaj sprawę</button><button data-pomoc="contract-add" hidden>Kontrakt</button></>);
    const button = screen.getByText('Dodaj sprawę');
    vi.spyOn(button, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    button.scrollIntoView = vi.fn();
    expect(visiblePomocMarkers()).toEqual([{ id: 'case-add', label: POMOC_MARKERS['case-add'] }]);
    highlightPomocMarker('case-add');
    expect(button).toHaveClass('pomoc-highlight');
    highlightPomocMarker('nieznany');
    expect(container.querySelector('.pomoc-highlight')).toBeNull();
});
