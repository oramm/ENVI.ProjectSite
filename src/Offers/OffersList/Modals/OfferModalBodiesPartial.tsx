import React, { useEffect } from "react";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ExternalOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import { OfferStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";

export function OfferModalBodyStatus({ initialData }: ModalBodyProps<OurOffer | ExternalOffer>) {
    const { setValue } = useFormContext();

    useEffect(() => {
        setValue("status", initialData?.status || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return <OfferStatusSelector />;
}
