import * as Yup from "yup";
import { MilestoneType } from "../../../../Typings/bussinesTypes";

export function makeMilestoneDateValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        description: Yup.string().max(300, "Opis może mieć maksymalnie 300 znaków"),
        startDate: Yup.date()
            .nullable()
            .typeError("Nieprawidłowy format daty rozpoczęcia")
            .required("Data rozpoczęcia jest wymagana")
            .test("start-before-end", "Rozpoczęcie nie może być po zakończeniu", function (value) {
                const { endDate } = this.parent;
                if (!value || !(endDate instanceof Date) || isNaN(endDate.getTime())) return true;
                return value <= endDate;
            }),

        endDate: Yup.date()
            .nullable()
            .typeError("Nieprawidłowy format daty zakończenia")
            .required("Data zakończenia jest wymagana")
            .test("end-after-start", "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia", function (value) {
                const { startDate } = this.parent;
                if (!value || !(startDate instanceof Date) || isNaN(startDate.getTime())) return true;
                return value >= startDate;
            }),
    });
}
