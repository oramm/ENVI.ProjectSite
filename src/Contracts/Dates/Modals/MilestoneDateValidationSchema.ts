import * as Yup from "yup";
import { MilestoneType } from "../../../../Typings/bussinesTypes";

export function makeMilestoneDateValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        description: Yup.string().max(300, "Opis może mieć maksymalnie 300 znaków"),
        startDate: Yup.date()
            .nullable()
            .typeError("Nieprawidłowy format daty rozpoczęcia")
            .required("Data rozpoczęcia jest wymagana")
            .max(Yup.ref("endDate"), "Rozpoczęcie nie może być po zakończeniu"),

        endDate: Yup.date()
            .nullable()
            .typeError("Nieprawidłowy format daty zakończenia")
            .required("Data zakończenia jest wymagana")
            .min(Yup.ref("startDate"), "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia"),
    });
}
