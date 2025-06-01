import React from 'react'
import CustomCheckbox from './CustomCheckbox'
import LabelledTextarea from './LabelledTextarea'
import LabelledInput from './LabelledInput'
import { InputTypes, MutliSelectOption } from '../common/types'
import MultiSelect from './MultiSelect'
import { UseFormRegister } from 'react-hook-form'

interface FormFieldsProps {
    labelValue: string,
    name: string,
    placeholder: string,
    value: any,
    inputType: InputTypes,
    register: UseFormRegister<any>,
    options?: MutliSelectOption[],
    errorMessage?: string
}

const FormFeilds: React.FC<FormFieldsProps> = ({ labelValue, name, placeholder, value, inputType, register, options, errorMessage }: FormFieldsProps) => {

    if (inputType === "checkbox")
        return (
            <CustomCheckbox
                labelValue={labelValue}
                name={name}
                value={value}
                register={register}
                errorMessage={errorMessage} />
        )

    if (inputType === "textarea")
        return (
            <LabelledTextarea
                labelValue={labelValue}
                name={name}
                placeholder={placeholder}
                value={value}
                register={register}
                errorMessage={errorMessage}
            />
        )

    if (inputType === "multiselect")
        return (
            <MultiSelect
                id={name + "s"}
                labelValue={labelValue}
                options={options}
                value={value}
                name={name}
                register={register} />
        )

    return (
        <LabelledInput
            labelValue={labelValue}
            inputType={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            register={register}
            errorMessage={errorMessage} />
    )
}

export default FormFeilds