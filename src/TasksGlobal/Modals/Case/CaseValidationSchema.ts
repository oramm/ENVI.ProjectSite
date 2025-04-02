import * as Yup from "yup";
import { CaseType } from "../../../../Typings/bussinesTypes";

export function makeCaseValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        name: Yup.string().test("conditional-required", "Nazwa jest wymagana", function (value) {
            const { _type } = this.parent as { _type?: CaseType };
            const isUnique = _type?.isUniquePerMilestone;
            if (!isUnique && !value) {
                return this.createError({ message: "Nazwa jest wymagana bo spraw tego typu może być więcej" });
            }
            return true;
        }),
        description: Yup.string().max(300, "Opis może mieć maksymalnie 300 znaków"),
    });
}
