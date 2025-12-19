import React from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleUp, faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons";

export type ExpandTrigger = { action: "COLLAPSE" | "EXPAND"; id: number } | null;

type ToggleExpandButtonProps = {
    expandTrigger: ExpandTrigger;
    setExpandTrigger: React.Dispatch<React.SetStateAction<ExpandTrigger>>;
    collapseTitle?: string;
    expandTitle?: string;
    className?: string;
    stopPropagation?: boolean;
};

export function ToggleExpandButton({
    expandTrigger,
    setExpandTrigger,
    collapseTitle = "Zwiń wszystko",
    expandTitle = "Rozwiń wszystko",
    className = "d-flex align-items-center justify-content-center me-2",
    stopPropagation = false,
}: ToggleExpandButtonProps) {
    const isCollapsed = expandTrigger?.action === "COLLAPSE";

    return (
        <Button
            variant="outline-secondary"
            size="sm"
            className={className}
            onClick={(e) => {
                if (stopPropagation) e.stopPropagation();
                setExpandTrigger({
                    action: isCollapsed ? "EXPAND" : "COLLAPSE",
                    id: Date.now(),
                });
            }}
            title={isCollapsed ? expandTitle : collapseTitle}
        >
            <FontAwesomeIcon icon={isCollapsed ? faAngleDoubleDown : faAngleDoubleUp} />
        </Button>
    );
}
