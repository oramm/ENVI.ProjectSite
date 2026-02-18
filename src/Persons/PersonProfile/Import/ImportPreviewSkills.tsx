import React from "react";
import { Form, Table } from "react-bootstrap";
import { AiProfileSkill } from "../../../../Typings/bussinesTypes";

interface Props {
    items: AiProfileSkill[];
    selectedIds: Set<number>;
    onToggle: (id: number) => void;
}

export default function ImportPreviewSkills({ items, selectedIds, onToggle }: Props) {
    if (items.length === 0) return null;
    return (
        <div className="mb-3">
            <h6>Umiejetnosci ({items.length})</h6>
            <Table size="sm" bordered hover>
                <thead>
                    <tr>
                        <th style={{ width: 30 }}></th>
                        <th>Nazwa</th>
                        <th>Poziom</th>
                        <th>Lata</th>
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
                            <td>{item.name}</td>
                            <td>{item.levelCode || "-"}</td>
                            <td>{item.yearsOfExperience != null ? `${item.yearsOfExperience}` : "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
