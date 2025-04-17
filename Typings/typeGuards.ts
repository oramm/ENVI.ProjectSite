import { OurContract, OtherContract } from "../Typings/bussinesTypes";

export function isOurContract(x: OurContract | OtherContract | undefined | null): x is OurContract {
    return !!x?._type?.isOur;
}

export function isOtherContract(x: OurContract | OtherContract | undefined | null): x is OtherContract {
    return x?._type?.isOur === false;
}
