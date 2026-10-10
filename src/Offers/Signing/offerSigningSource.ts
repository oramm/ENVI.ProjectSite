import { SigningApi } from "../../Signing/SigningApi";
import { SigningSource } from "../../Signing/SigningSource";

/**
 * Oferta zewnętrzna (pliki z folderu „Oferta”) jako źródło plików do podpisu. Miejsce grafiki wybiera
 * użytkownik na obrazie strony, gdy serwer nie znajdzie jednego oczywistego miejsca.
 */
export function offerSigningSource(offer: {
    id: number;
    alias: string;
    employerName?: string;
    /** Oznaczenie z wiersza listy ofert przed aliasem, np. „IK Nysa”. */
    listLabel?: string;
}): SigningSource {
    const { id, alias, employerName, listLabel } = offer;
    // Tytuł okna ma pozwolić rozpoznać ofertę tak, jak na liście: „IK Nysa | OŚ”, potem zamawiający.
    const name = listLabel ? `${listLabel} | ${alias}` : alias;
    return {
        key: `offer-${id}`,
        listFiles: () => SigningApi.listOfferSignableFiles(id),
        createJob: (files) => SigningApi.createOfferJob(id, files),
        listSignatures: async () => (await SigningApi.listOfferSignatures(id)).signatures,
        uploadSigned: (file) => SigningApi.uploadSignedToOffer(id, file),
        // Oferty nie mają plakietki „podpisane” na liście, więc nie ma czego odświeżać.
        onChanged: () => {},
        graphicPlace: {
            locate: (file) => SigningApi.locateOfferGraphicPlace(id, file.gdFileId),
            pageImage: (file, page) => SigningApi.offerFilePageImage(id, file.gdFileId, page),
        },
        texts: {
            subject: employerName ? `oferta ${name}, ${employerName}` : `oferta ${name}`,
            inFolder: "w folderze „Oferta”",
            thisHasAlready: "Ta oferta ma już",
        },
    };
}
