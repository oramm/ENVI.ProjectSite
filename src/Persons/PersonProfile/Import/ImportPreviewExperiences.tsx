import React from "react";
import { Form, Table } from "react-bootstrap";
import { AiProfileExperience } from "../../../../Typings/bussinesTypes";
import ToolsDate from "../../../React/Tools/ToolsDate";

interface Props {
    items: AiProfileExperience[];
    selectedIds: Set<number>;
    onToggle: (id: number) => void;
}

export default function ImportPreviewExperiences({ items, selectedIds, onToggle }: Props) {
    if (items.length === 0) return null;
    return (
        <div className="mb-3">
            <h6>Doswiadczenie ({items.length})</h6>
            <Table size="sm" bordered hover>
                <thead>
                    <tr>
                        <th style={{ width: 30 }}></th>
                        <th>Organizacja</th>
                        <th>Stanowisko</th>
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
                            <td>{item.organizationName || "-"}</td>
                            <td>{item.positionName || "-"}</td>
                            <td>
                                {item.dateFrom
                                    ? ToolsDate.dateISOToDMY(item.dateFrom)
                                    : <span className="text-warning small" title="Brak daty – wpis zostanie zaimportowany bez daty">⚠ brak</span>}
                            </td>
                            <td>
                                {item.isCurrent
                                    ? "aktualnie"
                                    : item.dateTo
                                      ? ToolsDate.dateISOToDMY(item.dateTo)
                                      : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
