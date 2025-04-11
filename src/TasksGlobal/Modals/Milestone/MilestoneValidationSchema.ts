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
                        .max(Yup.ref("endDate"), "Rozpoczęcie nie mze być po zakończeniu"),

                    endDate: Yup.date()
                        .nullable()
                        .typeError("Nieprawidłowy format daty zakończenia")
                        .required("Data zakończenia jest wymagana")
                        .min(Yup.ref("startDate"), "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia"),

                    description: Yup.string().nullable().max(300, "Opis dla okresu może mieć maksymalnie 300 znaków"),
                })
            )
            .min(1, "Przynajmniej jeden przedział daty musi być podany"),
    });
}
