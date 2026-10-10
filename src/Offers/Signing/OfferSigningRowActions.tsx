import React, { useMemo } from "react";
import { ExternalOffer, OurOffer } from "../../../Typings/bussinesTypes";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { SignPdfRowAction, UploadSignedRowAction } from "../../Signing/SigningRowActions";
import { offerSigningSource } from "./offerSigningSource";

type RowOffer = OurOffer | ExternalOffer;

/** To samo oznaczenie co w wierszu listy ofert: typ kontraktu i miasto. */
const offerListLabel = (offer: RowOffer) =>
    [offer._type?.name, offer._city?.name].filter(Boolean).join(" ") || undefined;

/**
 * Akcja wiersza „PDF z podpisem” dla ofert. Tylko oferty ZEWNĘTRZNE (składane w przetargach): ich pliki
 * leżą w folderze „Oferta”. Oferta własna takiego folderu nie ma (decyzja właściciela 2026-10-10).
 */
export function SignOfferFilesButton({ dataObject, layout }: RowActionMenuItemProps<RowOffer>) {
    const { id, alias, employerName } = dataObject;
    const listLabel = offerListLabel(dataObject);
    const source = useMemo(
        () => offerSigningSource({ id, alias, employerName, listLabel }),
        [id, alias, employerName, listLabel]
    );

    if (dataObject.isOur) return null;

    return <SignPdfRowAction source={source} layout={layout} />;
}

/** Akcja wiersza „Wgraj podpisany” dla ofert zewnętrznych. */
export function UploadSignedOfferFileButton({ dataObject, layout }: RowActionMenuItemProps<RowOffer>) {
    const { id, alias, employerName } = dataObject;
    const listLabel = offerListLabel(dataObject);
    const source = useMemo(
        () => offerSigningSource({ id, alias, employerName, listLabel }),
        [id, alias, employerName, listLabel]
    );

    if (dataObject.isOur) return null;

    return <UploadSignedRowAction source={source} layout={layout} />;
}
