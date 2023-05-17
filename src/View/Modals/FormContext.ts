import { createContext, useContext } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';

interface FormContextValues extends UseFormReturn<FieldValues> { }

const FormContext = createContext<FormContextValues | null>(null);

export const useFormContext = () => {
    const context = useContext(FormContext);

    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

export const FormProvider = FormContext.Provider;