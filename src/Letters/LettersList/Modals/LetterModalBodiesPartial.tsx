import React, { useEffect } from "react";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { IncomingLetter, OurLetter } from "../../../../Typings/bussinesTypes";
import {
    IncomingLetterStatusSelector,
    OurLetterStatusSelector,
} from "../../../View/Modals/CommonFormComponents/StatusSelectors";

export function LetterModalBodyStatus({ initialData }: ModalBodyProps<OurLetter | IncomingLetter>) {
    const { setValue } = useFormContext();
    const isOurLetter = initialData?.isOur;
    if (initialData?.isOur === undefined) return <>⚠️ Brak danych pisma</>;

    useEffect(() => {
        setValue("status", initialData?.status || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return isOurLetter ? <OurLetterStatusSelector /> : <IncomingLetterStatusSelector />;
}
