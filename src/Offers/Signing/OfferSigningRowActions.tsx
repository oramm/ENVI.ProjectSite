import React, { useMemo } from "react";
import { ExternalOffer, OurOffer } from "../../../Typings/bussinesTypes";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { SignPdfRowAction, UploadSignedRowAction } from "../../Signing/SigningRowActions";
import { offerSigningSource } from "./offerSigningSource";

type RowOffer = OurOffer | ExternalOffer;

/**
 * Akcja wiersza „PDF z podpisem” dla ofert. Tylko oferty ZEWNĘTRZNE (składane w przetargach): ich pliki
 * leżą w folderze „Oferta”. Oferta własna takiego folderu nie ma (decyzja właściciela 2026-10-10).
 */
export function SignOfferFilesButton({ dataObject, layout }: RowActionMenuItemProps<RowOffer>) {
    const { id, alias, employerName } = dataObject;
    const source = useMemo(() => offerSigningSource({ id, alias, employerName }), [id, alias, employerName]);

    if (dataObject.isOur) return null;

    return <SignPdfRowAction source={source} layout={layout} />;
}

/** Akcja wiersza „Wgraj podpisany” dla ofert zewnętrznych. */
export function UploadSignedOfferFileButton({ dataObject, layout }: RowActionMenuItemProps<RowOffer>) {
    const { id, alias, employerName } = dataObject;
    const source = useMemo(() => offerSigningSource({ id, alias, employerName }), [id, alias, employerName]);

    if (dataObject.isOur) return null;

    return <UploadSignedRowAction source={source} layout={layout} />;
}
