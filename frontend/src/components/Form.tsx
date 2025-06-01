import React from 'react'
import { useForm, SubmitHandler, DefaultValues } from "react-hook-form";
import { ZodSchema } from "zod";

import { FieldValues } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import FormFeilds from './FormFeilds';
import Button from './Button';
import { InputTypes, MutliSelectOption } from '@/common/types';

export interface FormField {
    labelValue: string,
    name: string,
    placeholder: string,
    inputType: InputTypes,
    options?: MutliSelectOption[]
}

interface FormProps<T extends FieldValues> {
    validationSchema: ZodSchema<T>,
    defaultValues: T,
    onSubmit: SubmitHandler<T>,
    fields: Array<FormField>,
    submitButtonTitle: string,
    submitButtonClasses?: string,
}

const Form = <T extends Record<string, any>>({ validationSchema: schema, defaultValues, onSubmit, fields, submitButtonTitle, submitButtonClasses }: FormProps<T>): React.ReactElement => {

    const { register, handleSubmit, formState: { errors } } = useForm<T>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as DefaultValues<T>,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field) => (
                <div key={field.name as string}>
                    <FormFeilds
                        labelValue={field.labelValue}
                        name={field.name as string}
                        placeholder={field.placeholder}
                        value={defaultValues[field.name as keyof T]}
                        inputType={field.inputType}
                        register={register}
                        options={field.options}
                        errorMessage={errors[field.name]?.message as string} />
                </div>
            ))}
            <div className='flex justify-end'>
                <Button
                    title={submitButtonTitle}
                    type='submit'
                    classes={`text-white bg-green-500 hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-700 ${submitButtonClasses}`} />
            </div>
        </form>
    )
}

export default Form