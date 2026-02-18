import React from "react";
import { Form, Table } from "react-bootstrap";
import { AiProfileEducation } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/Tools/ToolsDate";

interface Props {
    items: AiProfileEducation[];
    selectedIds: Set<number>;
    onToggle: (id: number) => void;
}

export default function ImportPreviewEducations({ items, selectedIds, onToggle }: Props) {
    if (items.length === 0) return null;
    return (
        <div className="mb-3">
            <h6>Wyksztalcenie ({items.length})</h6>
            <Table size="sm" bordered hover>
                <thead>
                    <tr>
                        <th style={{ width: 30 }}></th>
                        <th>Szkola</th>
                        <th>Tytul</th>
                        <th>Kierunek</th>
                        <th>Od</th>
                        <th>Do</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item._tempId}>
                            <td className="text-center">
                                <Form.Check
                                    checked={selectedIds.has(item._tempId)}
                                    onChange={() => onToggle(item._tempId)}
                                />
                            </td>
                            <td>{item.schoolName || "-"}</td>
                            <td>{item.degreeName || "-"}</td>
                            <td>{item.fieldOfStudy || "-"}</td>
                            <td>
                                {item.dateFrom
                                    ? ToolsDate.dateISOToDMY(item.dateFrom)
                                    : <span className="text-warning small" title="Brak daty – wpis zostanie zaimportowany bez daty">⚠ brak</span>}
                            </td>
                            <td>{item.dateTo ? ToolsDate.dateISOToDMY(item.dateTo) : "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
