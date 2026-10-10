import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import type { GraphicPlacement, GraphicPlaceSearch } from "./SigningApi";

type PageSize = Pick<GraphicPlaceSearch["pages"][number], "width" | "height">;

/** Ułamki obrazu liczone od góry zamieniamy na prostokąt PDF liczony od dołu. */
export function placementFromClick(
    page: number,
    size: PageSize,
    stampRel: GraphicPlaceSearch["stampRel"],
    fx: number,
    fy: number
): GraphicPlacement {
    const width = Math.min(stampRel.width, 1) * size.width;
    const height = Math.min(stampRel.height, 1) * size.height;
    return {
        page,
        rect: {
            x: Math.max(0, Math.min(fx * size.width - width / 2, size.width - width)),
            y: Math.max(0, Math.min((1 - fy) * size.height - height / 2, size.height - height)),
            width,
            height,
        },
    };
}

export function placementToOverlay({ rect }: GraphicPlacement, size: PageSize) {
    return {
        left: `${(rect.x / size.width) * 100}%`,
        top: `${((size.height - rect.y - rect.height) / size.height) * 100}%`,
        width: `${(rect.width / size.width) * 100}%`,
        height: `${(rect.height / size.height) * 100}%`,
    };
}

type Props = {
    fileName: string;
    search: GraphicPlaceSearch;
    initial?: GraphicPlacement;
    initialPage?: number;
    loadPage(page: number): Promise<Blob>;
    onConfirm(placement: GraphicPlacement): void;
    onCancel(): void;
    children?: React.ReactNode;
};

/** Treść i stopka tej samej fazy okna podpisu; wybór zatwierdzamy dopiero przyciskiem. */
export function GraphicPlacePicker({ fileName, search, initial, initialPage, loadPage, onConfirm, onCancel, children }: Props) {
    const [page, setPage] = useState(initial?.page ?? initialPage ?? 1);
    const [placement, setPlacement] = useState(initial);
    const [image, setImage] = useState<{ page: number; url: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const size = search.pages[page - 1];

    useEffect(() => {
        let active = true;
        let objectUrl: string | undefined;
        setImage(null);
        setError(null);
        async function load() {
            try {
                const blob = await loadPage(page);
                if (!active) return;
                objectUrl = URL.createObjectURL(blob);
                setImage({ page, url: objectUrl });
            } catch (reason) {
                if (active) setError(reason instanceof Error ? reason.message : "Sprawdź połączenie z PS.");
            }
        }
        load();
        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [page, loadPage, attempt]);

    return (
        <>
            <Modal.Body>
                {children}
                <h6 style={{ overflowWrap: "anywhere" }}>Miejsce grafiki — {fileName}</h6>
                <p className="small text-muted">
                    Kliknij w miejscu, w którym ma stanąć grafika podpisu. Gotowy PDF zobaczysz jeszcze przed wpisaniem PIN-u.
                </p>
                {search.pages.length > 1 && (
                    <div className="d-flex flex-wrap align-items-center justify-content-between mb-2" style={{ gap: "8px" }}>
                        <Button size="sm" variant="outline-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                            ‹ Poprzednia
                        </Button>
                        <span className="small text-muted">Strona {page} z {search.pages.length}</span>
                        <Button size="sm" variant="outline-secondary" disabled={page === search.pages.length} onClick={() => setPage(page + 1)}>
                            Następna ›
                        </Button>
                    </div>
                )}
                {!size.placeable && (
                    <Alert variant="warning" className="small py-2">
                        Na tej stronie nie da się ustawić grafiki (strona jest obrócona). Wybierz inną stronę.
                    </Alert>
                )}
                {error ? (
                    <Alert variant="warning" className="small py-2">
                        Nie udało się wczytać strony {page}: {error}
                        <div className="mt-2">
                            <Button size="sm" variant="outline-secondary" onClick={() => setAttempt((prev) => prev + 1)}>
                                Spróbuj ponownie
                            </Button>
                        </div>
                    </Alert>
                ) : image?.page === page ? (
                    <div className="position-relative" style={{ width: "100%" }}>
                        <img
                            src={image.url}
                            alt={`Strona ${page} dokumentu ${fileName}`}
                            className="d-block border"
                            style={{ width: "100%", maxWidth: "100%", cursor: size.placeable ? "crosshair" : "default" }}
                            onClick={(event) => {
                                if (!size.placeable) return;
                                const bounds = event.currentTarget.getBoundingClientRect();
                                if (bounds.width <= 0 || bounds.height <= 0) return;
                                setPlacement(placementFromClick(page, size, search.stampRel,
                                    (event.clientX - bounds.left) / bounds.width,
                                    (event.clientY - bounds.top) / bounds.height));
                            }}
                        />
                        {placement?.page === page && (
                            <div
                                aria-label="Tu stanie grafika podpisu"
                                className="position-absolute bg-success bg-opacity-25 border border-success small text-success d-flex align-items-center justify-content-center"
                                style={{ ...placementToOverlay(placement, size), pointerEvents: "none", overflow: "hidden", whiteSpace: "nowrap", lineHeight: 1, fontSize: "clamp(.6rem, 1.6vw, .8rem)" }}
                            >
                                tu stanie grafika
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="small text-muted" role="status">
                        <Spinner animation="border" size="sm" aria-hidden="true" className="me-2" />
                        Wczytuję stronę {page}…
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onCancel}>Anuluj</Button>
                <Button variant="success" disabled={!placement} onClick={() => placement && onConfirm(placement)}>
                    Zatwierdź miejsce
                </Button>
            </Modal.Footer>
        </>
    );
}
