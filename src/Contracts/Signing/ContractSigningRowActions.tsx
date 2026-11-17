import React, { useMemo } from "react";
import { OtherContract, OurContract } from "../../../Typings/bussinesTypes";
import { isOurContract } from "../../../Typings/typeGuards";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { SignPdfRowAction, UploadSignedRowAction } from "../../Signing/SigningRowActions";
import { contractSigningSource } from "./contractSigningSource";

type RowContract = OurContract | OtherContract;

/**
 * Akcja wiersza „PDF z podpisem” dla dokumentów umowy. Tylko umowy ENVI (nasze): umowa wykonawcy
 * nie jest podpisywana w ENVI, więc tu nic się nie pokazuje.
 */
export function SignContractDocumentsButton({ dataObject, layout }: RowActionMenuItemProps<RowContract>) {
    const ourContract = isOurContract(dataObject) ? dataObject : null;
    const { id, alias } = dataObject;
    const ourId = ourContract?.ourId ?? "";
    const source = useMemo(() => contractSigningSource({ id, ourId, alias }), [id, ourId, alias]);

    if (!ourContract) return null;

    return <SignPdfRowAction source={source} layout={layout} />;
}

/** Akcja wiersza „Wgraj podpisany” dla umów ENVI. */
export function UploadSignedContractDocumentButton({ dataObject, layout }: RowActionMenuItemProps<RowContract>) {
    const ourContract = isOurContract(dataObject) ? dataObject : null;
    const { id, alias } = dataObject;
    const ourId = ourContract?.ourId ?? "";
    const source = useMemo(() => contractSigningSource({ id, ourId, alias }), [id, ourId, alias]);

    if (!ourContract) return null;

    return <UploadSignedRowAction source={source} layout={layout} />;
}
