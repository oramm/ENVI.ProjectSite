import React, { useMemo } from "react";
import { Letter } from "../../../Typings/bussinesTypes";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { SignPdfRowAction, UploadSignedRowAction } from "../../Signing/SigningRowActions";
import { letterSigningSource } from "./letterSigningSource";

type RowLetter = Letter & { isOur: boolean };

/**
 * Akcja wiersza „PDF z podpisem” dla pism. Tylko pisma naszych (wychodzących); ten sam komponent obsługuje
 * rejestr pism kontraktowych i ofertowych, bo serwer rozpoznaje pismo po id.
 */
export function SignOurLetterPdfButton({ dataObject, layout }: RowActionMenuItemProps<RowLetter>) {
    const source = useMemo(() => letterSigningSource(dataObject.id, dataObject.number), [dataObject.id, dataObject.number]);

    if (!dataObject.isOur) return null;

    return <SignPdfRowAction source={source} layout={layout} />;
}

/** Akcja wiersza „Wgraj podpisany” dla pism naszych. */
export function UploadSignedLetterButton({ dataObject, layout }: RowActionMenuItemProps<RowLetter>) {
    const source = useMemo(() => letterSigningSource(dataObject.id, dataObject.number), [dataObject.id, dataObject.number]);

    if (!dataObject.isOur) return null;

    return <UploadSignedRowAction source={source} layout={layout} />;
}
