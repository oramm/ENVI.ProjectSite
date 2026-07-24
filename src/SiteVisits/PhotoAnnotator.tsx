import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft, faTrashCan } from "@fortawesome/free-solid-svg-icons";

// Kolory pisaka - jaskrawe, dobrze widoczne na zdjęciach z budowy.
const COLORS = ["#ff3b30", "#ffcc00", "#34c759", "#0a84ff", "#ffffff", "#000000"];

type Stroke = { color: string; width: number; points: { x: number; y: number }[] };

/**
 * Nakładka do rysowania palcem po zdjęciu (strzałki/zaznaczenia). Po zapisie
 * "wypala" rysunek w obrazie (canvas -> JPEG) i oddaje nowy Blob. Rysunek jest
 * na stałe w zdjęciu - zgodnie z decyzją nie przechowujemy osobno oryginału.
 */
export default function PhotoAnnotator({
    src,
    onSave,
    onClose,
}: {
    src: string; // objectURL bieżącej wersji zdjęcia
    onSave: (blob: Blob) => void;
    onClose: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const strokesRef = useRef<Stroke[]>([]);
    const drawingRef = useRef(false);
    const [color, setColor] = useState(COLORS[0]);
    const [ready, setReady] = useState(false);
    const [, force] = useState(0); // przerysowanie przycisków (cofnij aktywny)

    // Wczytaj obraz do canvasu w natywnej rozdzielczości (jakość zapisu).
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imgRef.current = img;
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            redraw();
            setReady(true);
        };
        img.src = src;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    function redraw() {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        for (const stroke of strokesRef.current) drawStroke(ctx, stroke);
    }

    function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
        if (stroke.points.length < 1) return;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
        ctx.stroke();
    }

    // Przelicz współrzędne wskaźnika (CSS px) na piksele canvasu (natywne).
    function toCanvasPoint(e: React.PointerEvent) {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * canvas.width,
            y: ((e.clientY - rect.top) / rect.height) * canvas.height,
        };
    }

    function onPointerDown(e: React.PointerEvent) {
        if (!ready) return;
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        drawingRef.current = true;
        // Grubość proporcjonalna do rozdzielczości, by kreska była widoczna na foto.
        const width = Math.max(4, (canvasRef.current!.width / 150) | 0);
        strokesRef.current.push({ color, width, points: [toCanvasPoint(e)] });
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!drawingRef.current) return;
        e.preventDefault();
        const stroke = strokesRef.current[strokesRef.current.length - 1];
        const prev = stroke.points[stroke.points.length - 1];
        const next = toCanvasPoint(e);
        stroke.points.push(next);
        // Rysujemy TYLKO nowy odcinek na już narysowanym canvasie - bez przerysowania
        // pełnowymiarowego zdjęcia przy każdym ruchu (to powodowało lagi na telefonie
        // przy zdjęciach wielomegapikselowych). Pełny redraw() tylko przy undo/clear.
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && prev) {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
    }

    function onPointerUp() {
        if (drawingRef.current) {
            drawingRef.current = false;
            force((n) => n + 1);
        }
    }

    function undo() {
        strokesRef.current.pop();
        redraw();
        force((n) => n + 1);
    }

    function clearAll() {
        strokesRef.current = [];
        redraw();
        force((n) => n + 1);
    }

    function save() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob(
            (blob) => {
                if (blob) onSave(blob);
            },
            "image/jpeg",
            0.85
        );
    }

    const hasStrokes = strokesRef.current.length > 0;

    return (
        <Modal show onHide={onClose} fullscreen>
            <Modal.Header closeButton>
                <Modal.Title className="fs-6">Zaznacz na zdjęciu</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column align-items-center bg-dark p-2">
                <div className="d-flex gap-2 mb-2 flex-wrap justify-content-center">
                    {COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            aria-label={`Kolor ${c}`}
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: c,
                                border:
                                    color === c
                                        ? "3px solid #fff"
                                        : "2px solid rgba(255,255,255,0.4)",
                                boxShadow: color === c ? "0 0 0 2px #000" : "none",
                            }}
                        />
                    ))}
                    <Button
                        variant="outline-light"
                        size="sm"
                        onClick={undo}
                        disabled={!hasStrokes}
                        title="Cofnij"
                    >
                        <FontAwesomeIcon icon={faRotateLeft} />
                    </Button>
                    <Button
                        variant="outline-light"
                        size="sm"
                        onClick={clearAll}
                        disabled={!hasStrokes}
                        title="Wyczyść"
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </Button>
                </div>
                <canvas
                    ref={canvasRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "calc(100vh - 190px)",
                        touchAction: "none",
                        background: "#000",
                        borderRadius: 4,
                    }}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Anuluj
                </Button>
                <Button variant="primary" onClick={save}>
                    Zapisz zaznaczenia
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
