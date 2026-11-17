/**
 * Przyciski wiersza umowy: tylko umowy ENVI (nasze) dostają podpis i wgranie; umowa wykonawcy nie dostaje nic.
 * SigningApi zaślepiony na granicy modułu, jak w SigningRowActions.test.tsx.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    listContractSignableFiles: vi.fn(),
    listContractSignatures: vi.fn(),
    createContractJob: vi.fn(),
    uploadSignedToContract: vi.fn(),
    locateContractGraphicPlace: vi.fn(),
    contractFilePageImage: vi.fn(),
}));
vi.mock("../../Signing/SigningApi", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../Signing/SigningApi")>()),
    SigningApi: api,
}));

import MainSetup from "../../React/MainSetupReact";
import { SignContractDocumentsButton, UploadSignedContractDocumentButton } from "./ContractSigningRowActions";

type ContractRow = React.ComponentProps<typeof SignContractDocumentsButton>["dataObject"];

const ourContract = (id = 9) =>
    ({ id, ourId: "KLO.IK.01", alias: "FENX.09.01", name: "Nadzór", _type: { isOur: true } }) as unknown as ContractRow;
const otherContract = () =>
    ({ id: 10, ourId: "", alias: "WYK", name: "Wykonawca", _type: { isOur: false } }) as unknown as ContractRow;

const SIGN_TITLE = "PDF z podpisem kwalifikowanym";
const UPLOAD_TITLE = "Wgraj podpisany PDF";

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(MainSetup, "currentUserOrNull", "get").mockReturnValue({ systemRoleName: "ENVI_EMPLOYEE" } as unknown as typeof MainSetup.currentUser);
    api.listContractSignableFiles.mockResolvedValue({ contractId: 9, contractLabel: "KLO.IK.01", files: [], notSignable: [] });
    api.listContractSignatures.mockResolvedValue({ contractId: 9, signatures: [] });
});

describe("akcje wiersza — umowa ENVI (nasza)", () => {
    it("nasza umowa ma przycisk podpisu i wgrania", () => {
        render(
            <>
                <SignContractDocumentsButton dataObject={ourContract()} layout="vertical" />
                <UploadSignedContractDocumentButton dataObject={ourContract()} layout="vertical" />
            </>
        );

        expect(screen.getByTitle(SIGN_TITLE)).toBeInTheDocument();
        expect(screen.getByTitle(UPLOAD_TITLE)).toBeInTheDocument();
    });

    it("„Wgraj podpisany” przy umowie otwiera okno z tytułem zawierającym oznaczenie i alias", async () => {
        render(<UploadSignedContractDocumentButton dataObject={ourContract()} layout="vertical" />);

        fireEvent.click(screen.getByTitle(UPLOAD_TITLE));

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByText("Wgraj podpisany — umowa KLO.IK.01 FENX.09.01")).toBeInTheDocument();
    });

    it("„PDF z podpisem” przy umowie pyta serwer o pliki tej umowy", async () => {
        render(<SignContractDocumentsButton dataObject={ourContract()} layout="vertical" />);

        fireEvent.click(screen.getByTitle(SIGN_TITLE));

        await waitFor(() => expect(api.listContractSignableFiles).toHaveBeenCalledWith(9));
        expect(await screen.findByText(/PDF z podpisem — umowa KLO.IK.01 FENX.09.01/)).toBeInTheDocument();
    });
});

describe("akcje wiersza — umowa wykonawcy (nie podpisujemy)", () => {
    it("umowa wykonawcy nie ma żadnego z tych przycisków", () => {
        const { container } = render(
            <>
                <SignContractDocumentsButton dataObject={otherContract()} layout="vertical" />
                <UploadSignedContractDocumentButton dataObject={otherContract()} layout="vertical" />
            </>
        );

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByTitle(SIGN_TITLE)).toBeNull();
        expect(screen.queryByTitle(UPLOAD_TITLE)).toBeNull();
    });
});
