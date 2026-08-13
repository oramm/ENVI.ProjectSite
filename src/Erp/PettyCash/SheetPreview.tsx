import React from "react";
import { Card } from "react-bootstrap";
import {
    CASH_HEADERS,
    CASH_WIDTHS,
    CashField,
    ItemField,
    PreviewCell,
    PreviewInput,
    PreviewItem,
    REGISTER_HEADERS,
    REGISTER_WIDTHS,
    previewCashRow,
    previewRegisterBlock,
} from "./previewRows";

const headerStyle: React.CSSProperties = {
    border: "1px solid #dee2e6",
    padding: "3px 6px",
    background: "#f1f3f5",
    fontWeight: 500,
    fontSize: 12,
    color: "#495057",
    verticalAlign: "bottom",
};

const derivedStyle: React.CSSProperties = {
    border: "1px solid #dee2e6",
    padding: "4px 6px",
    fontSize: 12,
    background: "#f8f9fa",
    color: "#6c757d",
    verticalAlign: "top",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
};

const inputStyle: React.CSSProperties = {
    border: "none",
    outline: "none",
    padding: "4px 6px",
    fontSize: 12,
    width: "100%",
    background: "transparent",
    resize: "none",
    display: "block",
    fontFamily: "inherit",
    lineHeight: 1.35,
};

function Cell({ cell, onChange }: { cell: PreviewCell; onChange: (value: string) => void }) {
    if (!cell.field && !cell.item)
        return (
            <td style={derivedStyle} title={cell.hint || undefined}>
                {cell.value || " "}
            </td>
        );

    const shared = {
        style: { ...inputStyle, textAlign: cell.numeric ? ("right" as const) : ("left" as const) },
        value: cell.value,
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange(event.target.value),
    };

    return (
        <td
            style={{
                border: "1px solid #dee2e6",
                padding: 0,
                verticalAlign: "top",
            }}
        >
            {cell.multiline ? (
                // Opis i „co wysłano” bywają długie — zawijamy zamiast ucinać.
                <textarea {...shared} rows={Math.min(6, Math.ceil((cell.value.length || 1) / 30))} />
            ) : (
                <input {...shared} inputMode={cell.numeric ? "decimal" : undefined} />
            )}
        </td>
    );
}

function SheetTable({
    headers,
    widths,
    rows,
    onCashChange,
    onItemChange,
}: {
    headers: string[];
    widths: number[];
    rows: PreviewCell[][];
    onCashChange: (field: CashField, value: string) => void;
    onItemChange: (index: number, field: ItemField, value: string) => void;
}) {
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>
                    {widths.map((width, index) => (
                        <col key={index} style={{ width }} />
                    ))}
                </colgroup>
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header} style={headerStyle}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <Cell
                                    key={cellIndex}
                                    cell={cell}
                                    onChange={(value) => {
                                        if (cell.item)
                                            onItemChange(cell.item.index, cell.item.field, value);
                                        else if (cell.field) onCashChange(cell.field, value);
                                    }}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Wiersz i blok w układzie arkusza — do oglądania i do wpisywania.
 *
 * To ta sama treść co formularz wyżej, tylko ułożona jak w arkuszu i podpięta pod ten
 * sam stan. Wpisanie tutaj zmienia formularz, wpisanie w formularzu zmienia to.
 *
 * Komórki szare są wyliczane — albo liczy je arkusz formułą (wydatek, suma, kolumna
 * wpływu przy karcie), albo składają się z kilku pól („kto zapłacił”). Po najechaniu
 * mówią, skąd się biorą.
 */
export default function SheetPreview({
    input,
    items,
    onCashChange,
    onItemChange,
}: {
    input: PreviewInput;
    items: PreviewItem[];
    onCashChange: (field: CashField, value: string) => void;
    onItemChange: (index: number, field: ItemField, value: string) => void;
}) {
    const isPostal = input.entryKind === "POSTAL";

    return (
        <Card className="mb-3">
            <Card.Body className="p-2">
                <div className="small text-muted mb-1">
                    Arkusz zaliczek — szare komórki liczy arkusz
                </div>
                <SheetTable
                    headers={CASH_HEADERS}
                    widths={CASH_WIDTHS}
                    rows={[previewCashRow(input)]}
                    onCashChange={onCashChange}
                    onItemChange={onItemChange}
                />

                {isPostal && (
                    <>
                        <div className="small text-muted mt-3 mb-1">
                            Rejestr listów — numer bloku nada arkusz
                        </div>
                        <SheetTable
                            headers={REGISTER_HEADERS}
                            widths={REGISTER_WIDTHS}
                            rows={previewRegisterBlock(input, items)}
                            onCashChange={onCashChange}
                            onItemChange={onItemChange}
                        />
                    </>
                )}
            </Card.Body>
        </Card>
    );
}
