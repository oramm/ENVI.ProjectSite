/**
 * SYNC-P2 — presentational tests for the FIDman sync status badge.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FidmanSyncBadge } from "./CommonComponents";

describe("FidmanSyncBadge", () => {
    it("renders nothing for status NONE / undefined", () => {
        const { container: c1 } = render(<FidmanSyncBadge status="NONE" />);
        expect(c1).toBeEmptyDOMElement();
        const { container: c2 } = render(<FidmanSyncBadge />);
        expect(c2).toBeEmptyDOMElement();
    });

    it("SENT -> synced label", () => {
        render(<FidmanSyncBadge status="SENT" />);
        expect(screen.getByText(/zsynchronizowano/i)).toBeInTheDocument();
    });

    it("FAILED -> 'synchronizacja do dopchnięcia' flag", () => {
        render(<FidmanSyncBadge status="FAILED" tooltip="HTTP 500" />);
        expect(screen.getByText(/dopchnięcia/i)).toBeInTheDocument();
    });

    it("SKIPPED -> missing-data flag (awizo braków)", () => {
        render(<FidmanSyncBadge status="SKIPPED" tooltip="Brak numeru NIP" />);
        expect(screen.getByText(/brakujące dane/i)).toBeInTheDocument();
    });
});
