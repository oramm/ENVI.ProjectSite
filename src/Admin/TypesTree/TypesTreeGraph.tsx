import React from "react";
import { Layout, LayoutNode, LayoutTask } from "./typesTreeLayout";

/**
 * Renderer grafu hierarchii - dwie warstwy, bez nowej zależności.
 *
 * Linie i numery folderów zostają w SVG, bo są krzywymi. Kafle rysuje HTML
 * pozycjonowany absolutnie NAD tą warstwą: kafel ma być wielowierszowy (lista
 * zadań, chevron, licznik), a w SVG każda taka rzecz to ręczne liczenie tekstu.
 * Pierwszą ofiarą tamtego liczenia było ucinanie nazwy na sztywno po 26 znakach
 * - teraz robi to CSS, a pełna nazwa zostaje w podpowiedzi.
 *
 * Komponent jest celowo głupi: cały układ liczy typesTreeLayout. Własnego stanu ma
 * tyle, co powiększenie i przeciąganie widoku - to obsługa myszy, nie układ.
 */

const FILL: Record<string, string> = {
    contractType: "#0d6efd",
    milestoneType: "#20c997",
    caseType: "#f7941d",
    subCaseType: "#adb5bd",
    emptyBranch: "#adb5bd",
};

/**
 * Fiolet dla zadań startowych - kolor w tym widoku dotąd nieużywany.
 *
 * Nie da się tu sięgnąć po zieleń ani pomarańcz: zielona linia znaczy „powstaje samo
 * przy nowej umowie", pomarańczowa przerywana „domyślne bez szablonu, nie powstanie",
 * a pomarańcz kafla to rodzaj „sprawa". Nowy sygnał nie zajmuje zajętego miejsca.
 */
const TASK_COLOR = "#6f42c1";

function nodeTitle(node: LayoutNode) {
    const lines: string[] = [];
    // E2 zostawia na kaflu samo przekreślenie, więc pełne słowo musi być tutaj -
    // inaczej znacznik nie mówi, DLACZEGO nazwa jest przekreślona.
    if (node.isRetired) lines.push("Ten typ umowy jest wycofany.");
    if (node.description) lines.push(node.description);
    // Nazwy ani licznika ukrytych dzieci tu nie ma CELOWO (decyzja ownera 2026-08-24):
    // nazwa stoi na kaflu, a licznik ma własną plakietkę „+N" z własną podpowiedzią.
    // Brak treści = brak atrybutu, nie pusty dymek.
    return lines.join("\n\n") || undefined;
}

/**
 * Jak mocno wygina się linia między poziomami. Ułamek poziomego odstępu, o jaki punkt
 * sterujący odchodzi od swojego końca: 0,5 to punkty w połowie drogi (tak było do
 * 2026-08-24), powyżej 0,5 punkty się mijają i linia wychodzi z kafla bardziej poziomo,
 * a w środku skręca ostrzej. Powyżej 1,0 krzywa zaczyna zawracać - stąd sufit.
 */
const EDGE_CURVE = 0.75;

/** Krzywa Béziera z prawej krawędzi węzła źródłowego do lewej krawędzi celu. */
function edgePath(from: LayoutNode, to: LayoutNode) {
    const x1 = from.x + from.w;
    const y1 = from.anchorY;
    const x2 = to.x;
    const y2 = to.anchorY;
    const reach = (x2 - x1) * EDGE_CURVE;
    return `M ${x1} ${y1} C ${x1 + reach} ${y1}, ${x2 - reach} ${y2}, ${x2} ${y2}`;
}

/** Slot na numer folderu - w SVG była to różnica 46 - 12 współrzędnych tekstu. */
const BADGE_SLOT = 34;
const PAD_X = 12;

const TASK_ROW_H = 20;

/**
 * Wysokość płótna. Odjęte 210 px to wszystko, co stoi nad płótnem i pod nim: pasek nawigacji,
 * pasek narzędzi karty i stopka strony. Liczba wzięta z POMIARU, nie z oka: przy 200 px strona
 * przewijała się o 7 px. Było 280 px, dopóki nad drzewem stał nagłówek strony z przyciskami,
 * a pod nim przycisk „Nieprzypisane typy" - oba przeniesione, więc płótno dostało te 70 px.
 */
const CANVAS_HEIGHT = "calc(100vh - 210px)";

/** Sufit powiększenia. Wyżej kafle są już tylko większe, nie czytelniejsze. */
const MAX_ZOOM = 2;

/**
 * Najmniejsze powiększenie: takie, przy którym CAŁA WYSOKOŚĆ drzewa mieści się w płótnie.
 *
 * Dalsze oddalanie niczego już nie odsłania - drzewo widać w całości - a kafle robią się
 * nieczytelne i łatwo zgubić się w pustym tle. Stała podłoga tego nie potrafiła: dla
 * gałęzi na trzydzieści typów spraw była za wysoko, a dla ubogiej za nisko.
 *
 * Sufit 1: przy niskim drzewie „zmieszczenie całości" wypadałoby powyżej 100% i podłoga
 * blokowałaby powrót do widoku 1:1.
 */
const minZoomFor = (layoutHeight: number, viewportHeight: number) =>
    Math.min(1, viewportHeight / layoutHeight);

const clampZoom = (value: number, floor: number) => Math.min(MAX_ZOOM, Math.max(floor, value));

/**
 * Wycinek płótna, który ma się zmieścić po kliknięciu lupy.
 *
 * To GAŁĄŹ wybranego typu umowy - kamienie, sprawy i podsprawy - powiększona o margines
 * płótna. Kolumna typów umów do wycinka NIE wchodzi: wypisuje wszystkie typy naraz i nie
 * ona ma dyktować powiększenie (ustalenie ownera 2026-08-28).
 *
 * Margines czytamy z układu, zamiast przepisywać stałą z `typesTreeLayout`: to odstęp
 * między najniższym kaflem a dolną krawędzią płótna. Dzięki temu, gdy gałąź jest najwyższą
 * rzeczą na płótnie, wycinek pokrywa się CO DO PIKSELA z całym płótnem - a więc kliknięcie
 * lupy daje dokładnie to samo powiększenie, co dokręcenie kółka do oporu, i nie zostaje
 * pasek przewijania. Wcześniej wycinek obejmował same kafle spraw, czyli był o dwa marginesy
 * niższy od płótna - i te kilkadziesiąt pikseli wracało jako pasek.
 */
function fitBounds(layout: Layout): { top: number; height: number } | null {
    const branch = layout.nodes.filter((node) => node.kind !== "contractType");
    // Bez typów spraw nie ma czego mieścić - przycisk i tak się wtedy nie pokazuje.
    if (!branch.some((node) => node.kind === "caseType")) return null;

    const lowest = Math.max(...layout.nodes.map((node) => node.y + node.h));
    const pad = Math.max(0, layout.height - lowest);
    const top = Math.max(0, Math.min(...branch.map((node) => node.y)) - pad);
    const bottom = Math.min(layout.height, Math.max(...branch.map((node) => node.y + node.h)) + pad);
    return bottom > top ? { top, height: bottom - top } : null;
}

/**
 * Czy któryś typ sprawy leży poza widocznym wycinkiem płótna.
 *
 * Liczone we WSPÓŁRZĘDNYCH UKŁADU, a nie z prostokątów DOM: przy powiększeniu wystarczy
 * podzielić przez `zoom`, a getBoundingClientRect w testach zwraca same zera i mierzenie
 * nim dawałoby wynik zależny od środowiska.
 *
 * Płótno centruje `margin: 0 auto`, więc gdy jest węższe od kontenera, dochodzi przesunięcie
 * o połowę różnicy - bez niego kafle wychodziłyby na lewo od widoku, którego tam nie ma.
 */
function hasCaseTypeOutOfView(layout: Layout, zoom: number, scroll: HTMLDivElement): boolean {
    const cases = layout.nodes.filter((node) => node.kind === "caseType");
    if (!cases.length) return false;
    const { clientWidth, clientHeight, scrollLeft, scrollTop } = scroll;
    // Kontener bez wymiarów (pierwsze renderowanie, środowisko testowe) - nie ma czego mierzyć.
    // Bez tego wyszłoby „wszystko poza widokiem" i przycisk świeciłby się zawsze.
    if (!clientWidth || !clientHeight) return false;

    const canvasOffsetLeft = Math.max(0, (clientWidth - layout.width * zoom) / 2);
    const left = (scrollLeft - canvasOffsetLeft) / zoom;
    const right = (scrollLeft - canvasOffsetLeft + clientWidth) / zoom;
    const top = scrollTop / zoom;
    const bottom = (scrollTop + clientHeight) / zoom;
    // Pół piksela luzu. Przy ułamkowym powiększeniu zaokrąglenia potrafią wystawić kafel
    // o setne części piksela i przycisk mrugałby bez powodu.
    const slack = 0.5 / zoom;

    return cases.some(
        (node) =>
            node.y < top - slack ||
            node.y + node.h > bottom + slack ||
            node.x < left - slack ||
            node.x + node.w > right + slack,
    );
}

/**
 * Wiersz zadania startowego wewnątrz kafla sprawy.
 *
 * Wnętrze kafla jest o 3 px węższe, niż mówi szerokość węzła (obwódka HTML leży
 * w całości wewnątrz), więc nazwa dostaje ellipsis, a nie sztywne ucinanie.
 */
function TaskRow({ task }: { task: LayoutTask }) {
    return (
        <div
            data-testid="types-tree-task"
            title={task.status ? `${task.name} (${task.status})` : task.name}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: TASK_ROW_H,
                minWidth: 0,
            }}
        >
            <span style={{ flex: "0 0 5px", width: 5, height: 5, borderRadius: 3, background: TASK_COLOR }} />
            <span
                style={{
                    fontSize: 11,
                    color: TASK_COLOR,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                }}
            >
                {task.name}
            </span>
            {/* „Backlog" znaczy: zadanie czeka poza bieżącą listą. Szare, nie fioletowe -
                fiolet niesie tu „to jest zadanie", status nie może mu tego odbierać. */}
            {task.status === "Backlog" && (
                <span
                    style={{
                        marginLeft: "auto",
                        flex: "0 0 auto",
                        fontSize: 9,
                        lineHeight: "12px",
                        color: "#6c757d",
                        border: "1px solid #dee2e6",
                        borderRadius: 3,
                        padding: "0 3px",
                    }}
                >
                    Backlog
                </span>
            )}
        </div>
    );
}

/**
 * Chevron zwijający gałąź. Osobny przycisk, nie całe pole kafla, bo klik w kafel
 * ma już swoje znaczenie (zaznacz, a przy drugim - edytuj) i nie wolno mu go odbierać.
 */
function Chevron({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            data-testid="types-tree-chevron"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Zwiń gałąź" : "Rozwiń gałąź"}
            title={isExpanded ? "Zwiń gałąź" : "Rozwiń gałąź"}
            onClick={(event) => {
                // Bez tego klik doszedłby do kafla i przy okazji otworzył edycję.
                event.stopPropagation();
                onToggle();
            }}
            style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                padding: 0,
                border: "none",
                background: "transparent",
                color: "#6c757d",
                cursor: "pointer",
                lineHeight: 0,
            }}
        >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                {/* Strzałka w dół = gałąź rozwinięta, w prawo = zwinięta. */}
                <path
                    d={isExpanded ? "M 1 3 L 5 7 L 9 3" : "M 3 1 L 7 5 L 3 9"}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}

function NodeTile({
    node,
    isSelected,
    onNodeClick,
    onToggleCollapse,
}: {
    node: LayoutNode;
    isSelected: boolean;
    onNodeClick?: (node: LayoutNode) => void;
    onToggleCollapse?: (node: LayoutNode) => void;
}) {
    const color = FILL[node.kind];
    const tasks = node.tasks ?? [];
    // Zadania schowane przełącznikiem nie znikają bez śladu - zostaje licznik.
    const hiddenTaskCount = tasks.length ? 0 : node.taskCount ?? 0;
    // Dzieci schowane zwinięciem albo globalną głębokością - też zostaje licznik.
    const hiddenCount = node.hiddenCount ?? 0;
    const hasChevron = Boolean(node.canCollapse && onToggleCollapse);
    const hasTrailing = hiddenTaskCount > 0 || hiddenCount > 0 || hasChevron;
    // Kafel „brak przypisanych kamieni" jest wyjaśnieniem, nie węzłem - nie ma
    // czego zaznaczać ani edytować, więc nie udaje klikalnego.
    const isExplanation = node.kind === "emptyBranch";
    const isClickable = Boolean(onNodeClick) && !isExplanation;
    // Wybrany typ umowy JEST zaznaczeniem tego widoku - to on decyduje, którą
    // gałąź widać. Rysujemy go tak samo jak zaznaczony węzeł, bo to ta sama rzecz.
    const isEmphasized = isSelected || (node.kind === "contractType" && node.isDimmed === false);
    return (
        <div
            data-testid="types-tree-node"
            data-node-id={node.id}
            data-retired={node.isRetired ? "true" : undefined}
            data-dimmed={node.isDimmed ? "true" : undefined}
            title={nodeTitle(node)}
            onClick={isClickable ? () => onNodeClick?.(node) : undefined}
            style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                width: node.w,
                height: node.h,
                boxSizing: "border-box",
                // Kolumna, nie wiersz: pod nagłówkiem z nazwą wisi lista zadań.
                // Nagłówek bierze całą resztę wysokości, więc przy kaflu bez zadań
                // wychodzi dokładnie to samo, co przed zmianą.
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                background: "#fff",
                borderRadius: 6,
                // Przerywana obwódka znaczy "wyłącznie jako podsprawa" - znaczenie
                // przeniesione 1:1 ze strokeDasharray, nie osłabione.
                // Przerywana obwódka niesie tu dwa znaczenia, ale w rozłącznych
                // kolumnach: w kolumnie podspraw „wyłącznie jako podsprawa",
                // w kolumnie kamieni pusty stan gałęzi, który nazywa się sam.
                border: `${isEmphasized ? 3 : 1.5}px ${
                    node.isSubCaseOnly || isExplanation ? "dashed" : "solid"
                } ${isEmphasized ? "#0d6efd" : color}`,
                cursor: isClickable ? "pointer" : "default",
                // Przygaszony kafel = gałąź, której teraz nie widać. Sygnał
                // celowo słaby: ma ustąpić pierwszeństwa wybranej gałęzi.
                opacity: node.isDimmed ? 0.55 : 1,
                overflow: "hidden",
            }}
        >
            {/* Listwa rodzaju - ta sama rola co prostokąt 4 px w SVG. */}
            <span
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    borderRadius: 2,
                    background: color,
                }}
            />
            <div
                data-testid="types-tree-node-header"
                style={{
                    flex: "1 1 auto",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: PAD_X,
                    paddingRight: 10,
                    minWidth: 0,
                }}
            >
                {node.badge && (
                    <span
                        style={{
                            flex: `0 0 ${BADGE_SLOT}px`,
                            fontSize: 11,
                            fontFamily: "monospace",
                            color: "#6c757d",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {node.badge}
                    </span>
                )}
                <span
                    style={{
                        fontSize: 12,
                        color: isExplanation ? "#6c757d" : "#212529",
                        fontStyle: isExplanation ? "italic" : undefined,
                        // E2: sama przekreślona nazwa, bez plakietki „wycofany" -
                        // plakietka w kolumnie 230 px zjadałaby nazwę.
                        textDecoration: node.isRetired ? "line-through" : undefined,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                        // Odstęp tylko wtedy, gdy jest od czego - bez liczników i bez
                        // chevronu kafel wygląda co do piksela tak, jak przed zmianą.
                        marginRight: hasTrailing ? 6 : 0,
                    }}
                >
                    {node.label}
                </span>
                {/* Prawa strona nagłówka: liczniki i chevron zawsze w tym samym
                    miejscu, żeby wzrok nie musiał ich szukać po kaflach. */}
                {hasTrailing && (
                    <span
                        style={{
                            marginLeft: "auto",
                            flex: "0 0 auto",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        {hiddenTaskCount > 0 && (
                            <span
                                data-testid="types-tree-task-count"
                                title={`Zadania startowe: ${hiddenTaskCount}. Włącz przełącznik „Zadania", żeby je zobaczyć.`}
                                style={{
                                    flex: "0 0 auto",
                                    fontSize: 10,
                                    lineHeight: "14px",
                                    color: TASK_COLOR,
                                    border: `1px solid ${TASK_COLOR}`,
                                    borderRadius: 8,
                                    padding: "0 5px",
                                }}
                            >
                                {hiddenTaskCount} zad.
                            </span>
                        )}
                        {hiddenCount > 0 && (
                            <span
                                data-testid="types-tree-hidden-count"
                                title={node.hiddenLabel}
                                style={{
                                    flex: "0 0 auto",
                                    fontSize: 10,
                                    lineHeight: "14px",
                                    color: "#495057",
                                    background: "#e9ecef",
                                    borderRadius: 8,
                                    padding: "0 5px",
                                }}
                            >
                                +{hiddenCount}
                            </span>
                        )}
                        {hasChevron && (
                            <Chevron
                                isExpanded={Boolean(node.isExpanded)}
                                onToggle={() => onToggleCollapse?.(node)}
                            />
                        )}
                    </span>
                )}
            </div>
            {tasks.length > 0 && (
                <div
                    data-testid="types-tree-task-list"
                    style={{
                        flex: "0 0 auto",
                        borderTop: "1px solid #e9ecef",
                        paddingTop: 3,
                        paddingLeft: PAD_X,
                        paddingRight: 10,
                    }}
                >
                    {tasks.map((task) => (
                        <TaskRow key={task.id} task={task} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function TypesTreeGraph({
    layout,
    selectedNodeId,
    onNodeClick,
    onToggleCollapse,
}: {
    layout: Layout;
    selectedNodeId?: string | null;
    onNodeClick?: (node: LayoutNode) => void;
    onToggleCollapse?: (node: LayoutNode) => void;
}) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const panRef = React.useRef<{ x: number; y: number; left: number; top: number } | null>(null);
    const [zoom, setZoom] = React.useState(1);
    /** Czy przycisk dopasowania ma się w ogóle pokazać - patrz `hasCaseTypeOutOfView`. */
    const [isCaseTypeOutOfView, setIsCaseTypeOutOfView] = React.useState(false);
    /**
     * Zlecenie dopasowania: wycinek do pokazania plus numer kolejny.
     *
     * Przewinięcie musi pójść PO tym, jak przeglądarka zastosuje nowe powiększenie -
     * wcześniej płótno ma jeszcze starą wysokość i obcina `scrollTop`. Numer jest potrzebny,
     * bo drugie kliknięcie z rzędu wylicza to samo powiększenie i bez niego efekt by nie ruszył.
     */
    const [fitRequest, setFitRequest] = React.useState<{ top: number; height: number; id: number } | null>(
        null,
    );

    // Ctrl+kółko przybliża. Listener wieszany ręcznie, bo React podpina „wheel" jako
    // pasywny - preventDefault w propsie nic by nie dał i przybliżałaby się cała strona.
    React.useEffect(() => {
        const scroll = scrollRef.current;
        if (!scroll) return;
        const onWheel = (event: WheelEvent) => {
            if (!event.ctrlKey) return;
            event.preventDefault();
            // Podłoga liczona przy KAŻDYM ruchu kółka, nie raz przy montowaniu: zależy
            // od wysokości drzewa i od okna, a jedno i drugie zmienia się w trakcie pracy.
            const floor = minZoomFor(layout.height, scroll.clientHeight);
            setZoom((current) => clampZoom(current * (event.deltaY < 0 ? 1.1 : 1 / 1.1), floor));
        };
        scroll.addEventListener("wheel", onWheel, { passive: false });
        return () => scroll.removeEventListener("wheel", onWheel);
        // layout w zależnościach, bo przy pustym drzewie kontenera jeszcze nie ma.
    }, [layout]);

    /**
     * Dopasowanie widoku do gałęzi wybranego typu umowy - patrz `fitBounds`.
     *
     * O powiększeniu decyduje PION: typy spraw mają stanąć od górnej do dolnej krawędzi.
     * Poziom tylko pilnuje, żeby przy niskiej gałęzi nie wyjechały poza widok kolumny
     * kamieni i podspraw - bez tego „całe drzewo widoczne" przestawałoby być prawdą
     * dokładnie wtedy, gdy jest najmniej powodów, żeby cokolwiek chować.
     */
    const fitCaseTypes = () => {
        const scroll = scrollRef.current;
        const bounds = fitBounds(layout);
        if (!scroll || !bounds || !scroll.clientHeight) return;
        const next = clampZoom(
            Math.min(scroll.clientHeight / bounds.height, scroll.clientWidth / Math.max(1, layout.width)),
            minZoomFor(layout.height, scroll.clientHeight),
        );
        setZoom(next);
        setFitRequest((previous) => ({ ...bounds, id: (previous?.id ?? 0) + 1 }));
    };

    React.useLayoutEffect(() => {
        const scroll = scrollRef.current;
        if (!fitRequest || !scroll) return;
        const visibleHeight = fitRequest.height * zoom;
        // Zapas pionowy zostaje tylko wtedy, gdy dopasowanie ograniczyła szerokość drzewa.
        // Wtedy gałąź idzie na środek, a nie pod górną krawędź. Dolne odcięcie na zero, bo
        // środkowanie wycinka zaczepionego u samej góry płótna wyszłoby poniżej niego -
        // przeglądarka i tak by to ucięła, ale wtedy w kodzie stałaby liczba bez pokrycia.
        scroll.scrollTop = Math.max(
            0,
            fitRequest.top * zoom - Math.max(0, (scroll.clientHeight - visibleHeight) / 2),
        );
        scroll.scrollLeft = Math.max(0, (layout.width * zoom - scroll.clientWidth) / 2);
        // Celowo tylko `fitRequest`: efekt ma się odpalić po kliknięciu, a nie po każdym
        // ruchu kółkiem. `zoom` jest tu już nowy, bo obie zmiany stanu idą jedną paczką.
    }, [fitRequest]);

    // Przycisk pojawia się wyłącznie wtedy, gdy jest co pokazywać, więc stan trzeba
    // odświeżać po przewinięciu, po powiększeniu, po zmianie drzewa i po zmianie rozmiaru
    // okna. ResizeObserver-a nie ma w środowisku testowym, a płótno i tak zmienia rozmiar
    // razem z oknem: wysokość to `calc(100vh - ...)`, szerokość bierze się z szerokości karty.
    React.useEffect(() => {
        const scroll = scrollRef.current;
        if (!scroll) return;
        const measure = () => setIsCaseTypeOutOfView(hasCaseTypeOutOfView(layout, zoom, scroll));
        measure();
        scroll.addEventListener("scroll", measure, { passive: true });
        window.addEventListener("resize", measure);
        return () => {
            scroll.removeEventListener("scroll", measure);
            window.removeEventListener("resize", measure);
        };
    }, [layout, zoom, fitRequest]);

    // Przeciąganie TŁA przesuwa widok w OBU osiach - wewnątrz kontenera, nie stroną.
    // `preventDefault` na wciśnięciu: bez niego przeglądarka po kilku pikselach uznaje
    // ruch za zaznaczanie tekstu i przeciąganie się urywa.
    // Kafle, chevrony i plakietki zostają klikalne, bo ciągnie się wyłącznie tło.
    const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
        const scroll = scrollRef.current;
        if (!scroll || event.button !== 0) return;
        if ((event.target as HTMLElement).closest("[data-node-id]")) return;
        event.preventDefault();
        panRef.current = { x: event.clientX, y: event.clientY, left: scroll.scrollLeft, top: scroll.scrollTop };
        scroll.setPointerCapture(event.pointerId);
    };
    const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;
        const scroll = scrollRef.current;
        if (!pan || !scroll) return;
        scroll.scrollLeft = pan.left - (event.clientX - pan.x);
        scroll.scrollTop = pan.top - (event.clientY - pan.y);
    };
    const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!panRef.current) return;
        panRef.current = null;
        scrollRef.current?.releasePointerCapture(event.pointerId);
    };

    if (!layout.nodes.length) {
        // Od kolumny zerowej pusta jest już tylko sytuacja „nie wybrano typu" -
        // typ bez kamieni ma własny kafel w kolumnie kamieni i tłumaczy się sam.
        return <div className="text-muted p-3">Nie wybrano typu umowy.</div>;
    }

    const byId = new Map(layout.nodes.map((node) => [node.id, node]));

    return (
        // Warstwa nad płótnem. Przycisk NIE MOŻE stać wewnątrz płótna: jechałby razem
        // z drzewem przy przewijaniu i uciekał z widoku dokładnie wtedy, gdy jest
        // potrzebny. Stąd pozycjonowany kontener, który płótno obejmuje.
        <div style={{ position: "relative" }}>
            {isCaseTypeOutOfView && (
                <button
                    type="button"
                    data-testid="types-tree-fit"
                    aria-label="Pokaż wszystkie typy spraw"
                    title="Dopasuje widok tak, żeby zmieściły się wszystkie typy spraw."
                    onClick={fitCaseTypes}
                    // Wygląd i najechanie z Bootstrapa, bez własnego stanu. Wariant „light"
                    // trzyma CZARNY znak w każdym stanie, więc nie da się powtórzyć usterki,
                    // przez którą przycisk robił się pusty: tamta brała się z „outline-secondary"
                    // (biały tekst na najechaniu) przy nadpisanym na biało tle. Tu nie nadpisujemy
                    // ani koloru, ani tła - i nie ma czemu się rozjechać.
                    className="btn btn-light border rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                    style={{
                        // Lewy dolny róg płótna (ustalenie ownera 2026-08-28). Przycisk leży
                        // NAD paskami przewijania, więc nie da się go nimi zasłonić - odwrotnie
                        // niż przy narzędziach wpisanych w róg karty (uwaga ownera 2026-08-24).
                        position: "absolute",
                        left: 12,
                        bottom: 12,
                        zIndex: 2,
                        width: 42,
                        height: 42,
                    }}
                >
                    {/* Lupa z minusem: „pokaż więcej naraz". Rysowana tutaj, bo cały ten plik
                        rysuje swoje znaki sam (patrz Chevron) i nie ma ani jednego importu ikon. */}
                    <svg width="19" height="19" viewBox="0 0 16 16" aria-hidden="true">
                        <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                        <line
                            x1="4.9"
                            y1="7"
                            x2="9.1"
                            y2="7"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                        />
                        <line
                            x1="10.4"
                            y1="10.4"
                            x2="14.2"
                            y2="14.2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            )}
            {/* Płótno o ograniczonej wysokości z własnym przewijaniem w OBU osiach.
                Wcześniej karta rosła na pełną wysokość drzewa i przewijała się cała strona;
                owner poprosił 2026-08-24, żeby ruszało się samo płótno, a strona stała.
                Wysokość liczona od okna, żeby nagłówek strony, pasek narzędzi i przycisk
                pod drzewem zostały widoczne.

                Wyśrodkowanie przez margin auto, NIE przez flexa: ten przy zawartości
                szerszej od kontenera wypycha ją poza obie krawędzie i lewej strony
                nie da się doscrollować. */}
            <div
                data-testid="types-tree-scroll"
                ref={scrollRef}
                onPointerDown={startPan}
                onPointerMove={movePan}
                onPointerUp={endPan}
                onPointerCancel={endPan}
                style={{
                    overflow: "auto",
                    maxWidth: "100%",
                    height: CANVAS_HEIGHT,
                    minHeight: 320,
                    cursor: "grab",
                    // Zaznaczanie tekstu psuło przeciąganie; w drzewie nie ma czego zaznaczać.
                    userSelect: "none",
                    // Dojechanie do krawędzi płótna nie przewija strony pod spodem.
                    overscrollBehavior: "contain",
                }}
            >
                <div
                    data-testid="types-tree-canvas"
                    role="group"
                    aria-label="Hierarchia typów"
                    style={{
                        position: "relative",
                        width: layout.width,
                        height: layout.height,
                        margin: "0 auto",
                        // Powiększenie z Ctrl+kółka. Właściwość „zoom", nie „transform: scale":
                        // zoom zmienia układ, więc pasek przewijania sam wie, ile miejsca zajmuje
                        // drzewo - przy transformacji trzeba by przeliczać płótno ręcznie.
                        zoom,
                    }}
                >
                    <svg
                        width={layout.width}
                        height={layout.height}
                        viewBox={`0 0 ${layout.width} ${layout.height}`}
                        aria-hidden="true"
                        style={{ position: "absolute", left: 0, top: 0, display: "block" }}
                    >
                        {layout.edges.map((edge, index) => {
                            const from = byId.get(edge.fromId);
                            const to = byId.get(edge.toId);
                            if (!from || !to) return null;
                            const path = edgePath(from, to);
                            const midX = (from.x + from.w + to.x) / 2;
                            const midY = (from.y + from.h / 2 + to.y + to.h / 2) / 2;
                            return (
                                <g key={`${edge.fromId}->${edge.toId}-${index}`}>
                                    {/* Pomarańczowa przerywana = oznaczone jako domyślne, ale bez
                                        szablonu, więc mimo flagi nie powstanie. */}
                                    <path
                                        d={path}
                                        fill="none"
                                        stroke={edge.hasGap ? "#fd7e14" : edge.isDefault ? "#198754" : "#ced4da"}
                                        strokeWidth={edge.isDefault || edge.hasGap ? 2.5 : 1.5}
                                        strokeDasharray={edge.hasGap ? "6 4" : undefined}
                                    />
                                    {edge.label && (
                                        <>
                                            <rect x={midX - 13} y={midY - 9} width={26} height={18} rx={4} fill="#fff" />
                                            <text
                                                x={midX}
                                                y={midY + 4}
                                                textAnchor="middle"
                                                fontSize={11}
                                                fontFamily="monospace"
                                                fill="#495057"
                                            >
                                                {edge.label}
                                            </text>
                                        </>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {layout.nodes.map((node) => (
                        <NodeTile
                            key={node.id}
                            node={node}
                            isSelected={node.id === selectedNodeId}
                            onNodeClick={onNodeClick}
                            onToggleCollapse={onToggleCollapse}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
