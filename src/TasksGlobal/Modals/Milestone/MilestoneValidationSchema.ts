import * as Yup from "yup";
import { MilestoneType } from "../../../../Typings/bussinesTypes";

export function makeMilestoneValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        _type: Yup.object().required("Typ kamienia milowego jest wymagany"),
        name: Yup.string().test("conditional-required", "Nazwa jest wymagana", function (value) {
            const { _type } = this.parent as { _type?: MilestoneType };
            const isUnique = _type?.isUniquePerContract;
            if (!isUnique && !value) {
                return this.createError({ message: "Nazwa jest wymagana, bo kamieni tego typu może być więcej" });
            }
            return true;
        }),
        description: Yup.string().max(300, "Opis może mieć maksymalnie 300 znaków"),
        status: Yup.string().required("Status jest wymagany"),
        _dates: Yup.array()
            .of(
                Yup.object().shape({
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

                    description: Yup.string().nullable().max(300, "Opis dla okresu może mieć maksymalnie 300 znaków"),
                })
            )
            .min(1, "Przynajmniej jeden przedział daty musi być podany"),
    });
}
