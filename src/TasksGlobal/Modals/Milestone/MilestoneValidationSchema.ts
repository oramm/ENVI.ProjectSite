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
        startDate: Yup.date()
            .transform((value, originalValue) => (originalValue === "" ? null : value))
            .nullable()
            .typeError("Nieprawidłowy format daty rozpoczęcia")
            .max(Yup.ref("endDate"), "Data rozpoczęcia nie może być późniejsza niż data zakończenia"),
        endDate: Yup.date()
            .transform((value, originalValue) => (originalValue === "" ? null : value))
            .nullable()
            .typeError("Nieprawidłowy format daty zakończenia")
            .min(Yup.ref("startDate"), "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia"),
    });
}
