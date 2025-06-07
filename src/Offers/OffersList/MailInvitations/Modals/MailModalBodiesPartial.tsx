import React, { useEffect } from "react";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import { OfferInvitationMailToProcessData } from "../../../../../Typings/bussinesTypes";
import { OfferInvitationMailStatusSelector } from "../../../../View/Modals/CommonFormComponents/StatusSelectors";

export function MailModalBodyStatus({ initialData }: ModalBodyProps<OfferInvitationMailToProcessData>) {
    const { setValue } = useFormContext();

    useEffect(() => {
        setValue("status", initialData?.status || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return <OfferInvitationMailStatusSelector />;
}
