import { SigningApi } from "../../Signing/SigningApi";
import { SigningSource } from "../../Signing/SigningSource";
import { invalidateLetterSignatures } from "./letterSignaturesStore";

/** Pismo (kontraktowe albo ofertowe) jako źródło plików do podpisu. */
export function letterSigningSource(letterId: number, letterNumber?: string | number | null): SigningSource {
    return {
        key: `letter-${letterId}`,
        listFiles: () => SigningApi.listSignableFiles(letterId),
        createJob: (files) => SigningApi.createJob(letterId, files),
        listSignatures: async () => (await SigningApi.listLetterSignatures(letterId)).signatures,
        uploadSigned: (file) => SigningApi.uploadSigned(letterId, file),
        onChanged: () => invalidateLetterSignatures(letterId),
        texts: {
            subject: `pismo ${letterNumber ?? ""}`.trim(),
            inFolder: "w folderze pisma",
            thisHasAlready: "To pismo ma już",
            mainDocBadge: "pismo",
            lockedGraphicNote:
                "Pismo zawsze dostaje widoczny podpis z grafiką ENVI (pod „Z poważaniem”), więc tego pola nie da się wyłączyć.",
            noMainDocNote: "Pismo nie ma dokumentu na Dysku — nie ma czego podpisać.",
            doneNote: "Na liście pism pismo ma teraz plakietkę „podpisane”.",
        },
    };
}
