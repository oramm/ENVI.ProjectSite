import React, { useEffect } from "react";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { MilestoneDateData } from "../../../../Typings/bussinesTypes";
import {
    ContractStatusSelector,
    MilestoneStatusSelector,
} from "../../../View/Modals/CommonFormComponents/StatusSelectors";

export function ContractModalBodyStatus({ initialData }: ModalBodyProps<MilestoneDateData>) {
    const { setValue } = useFormContext();
    console.log("initialData", initialData);
    useEffect(() => {
        setValue("_milestone._contract.status", initialData?._milestone?._contract?.status || "", {
            shouldValidate: true,
        });
    }, [initialData, setValue]);

    return <ContractStatusSelector name="_milestone._contract.status" />;
}

export function MilestoneModalBodyStatus({ initialData }: ModalBodyProps<MilestoneDateData>) {
    const { setValue } = useFormContext();
    console.log("initialData", initialData);
    useEffect(() => {
        setValue("_milestone.status", initialData?._milestone?.status || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return <MilestoneStatusSelector name="_milestone.status" />;
}
