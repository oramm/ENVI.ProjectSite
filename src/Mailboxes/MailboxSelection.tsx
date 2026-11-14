import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { ProjectData } from "../../Typings/bussinesTypes";
import { useFormContext } from "../View/Modals/FormContext";
import { fetchMailboxes, MailboxSelectionValue, suggestMailboxAddress } from "./mailboxesService";

export function MailboxSelection({ contract = false }: { contract?: boolean }) {
    const { watch, setValue } = useFormContext();
    const selection = watch("_mailboxSelection") as MailboxSelectionValue | undefined;
    const mode = selection?.mode ?? "project";
    const project = watch("_project") as ProjectData | undefined;
    const type = watch("_type") as { isOur?: boolean } | undefined;
    const addressRequired = contract && mode === "separate" && type?.isOur === false;
    const ownCode = watch("ourId") as string | undefined;
    const code = contract && mode === "project" ? project?.ourId : ownCode;
    const [suggestion, setSuggestion] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!selection) setValue("_mailboxSelection", { mode: "project" });
    }, [selection, setValue]);

    useEffect(() => {
        setSuggestion("");
        setError("");
        if (!code || mode === "none") return;
        let cancelled = false;
        async function resolveAddress() {
            if (contract && mode === "project" && project?.id) {
                const mailboxes = await fetchMailboxes({ projectId: project.id });
                if (mailboxes[0]) return { address: mailboxes[0].address };
            }
            return suggestMailboxAddress(code!);
        }
        resolveAddress()
            .then(result => { if (!cancelled) setSuggestion(result.address); })
            .catch(() => { if (!cancelled) setError("Nie udało się podpowiedzieć adresu. Domyślny adres zostanie ustalony przy zapisie."); });
        return () => { cancelled = true; };
    }, [code, mode, contract, project?.id]);

    return (
        <Form.Group className="mt-3">
            <Form.Label>Skrzynka e-mail</Form.Label>
            <div>
                {([
                    ["project", "Skrzynka projektu"],
                    ...(contract ? [["separate", "Osobna skrzynka kontraktu"], ["none", "Bez skrzynki"]] : []),
                ] as [MailboxSelectionValue["mode"], string][]).map(([value, label]) => (
                    <Form.Check key={value} type="radio" inline name="mailboxMode" id={`mailboxMode-${value}`}
                        label={label} checked={mode === value}
                        onChange={() => setValue("_mailboxSelection", { mode: value }, { shouldValidate: true })} />
                ))}
            </div>
            {mode !== "none" && <>
                <Form.Label htmlFor="mailboxAddress" className="mt-2">Adres skrzynki</Form.Label>
                <Form.Control id="mailboxAddress" type="email" maxLength={254}
                    required={addressRequired}
                    readOnly={contract && mode === "project"}
                    value={selection?.address ?? suggestion}
                    placeholder="np. projekt@envi.com.pl"
                    onChange={event => setValue("_mailboxSelection", { mode, address: event.target.value }, { shouldValidate: true })} />
                <Form.Text>
                    {addressRequired
                        ? "Ta umowa nie ma oznaczenia ENVI. Wpisz adres osobnej skrzynki."
                        : contract && mode === "project"
                        ? "Jeśli projekt ma już skrzynkę, zostanie użyta. W przeciwnym razie powstanie po zapisie umowy z adresu wynikającego z oznaczenia projektu."
                        : "Adres trafi do klientów. Pozostaw puste, aby użyć oznaczenia nadanego przy zapisie."}
                </Form.Text>
                {error && <div className="small text-warning">{error}</div>}
            </>}
        </Form.Group>
    );
}
