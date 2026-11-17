import { SigningApi } from "../../Signing/SigningApi";
import { SigningSource } from "../../Signing/SigningSource";

/**
 * Dokumenty umowy ENVI jako źródło plików do podpisu: pliki z folderu sprawy „Umowa i zmiany”.
 * Każdy plik domyślnie bez grafiki; miejsce grafiki znajduje serwer przy nagłówku „Wykonawca”
 * w bloku podpisu, a gdy go nie znajdzie, użytkownik klika je na obrazie strony.
 */
export function contractSigningSource(contract: {
    id: number;
    ourId: string;
    number?: string;
    alias?: string;
    name?: string;
}): SigningSource {
    const { id, ourId, alias } = contract;
    // Alias bywa kopią oznaczenia (np. „DUW.AQM.02”) - wtedy go nie powtarzamy.
    const aliasPart = alias?.trim() && alias.trim() !== ourId ? ` ${alias.trim()}` : "";
    return {
        key: `contract-${id}`,
        listFiles: () => SigningApi.listContractSignableFiles(id),
        createJob: (files) => SigningApi.createContractJob(id, files),
        listSignatures: async () => (await SigningApi.listContractSignatures(id)).signatures,
        uploadSigned: (file) => SigningApi.uploadSignedToContract(id, file),
        // Umowy nie mają plakietki „podpisane” na liście, więc nie ma czego odświeżać.
        onChanged: () => {},
        // W folderze „Umowa i zmiany” leży też SWZ, plany płatności i protokoły: użytkownik sam wskazuje, co podpisuje.
        preselectFiles: false,
        graphicPlace: {
            locate: (file) => SigningApi.locateContractGraphicPlace(id, file.gdFileId),
            pageImage: (file, page) => SigningApi.contractFilePageImage(id, file.gdFileId, page),
        },
        texts: {
            subject: `umowa ${ourId}${aliasPart}`,
            inFolder: "w folderze „Umowa i zmiany”",
            thisHasAlready: "Ten kontrakt ma już",
        },
    };
}
