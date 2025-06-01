import React from 'react'
import { InputTypes } from '../common/types'
import { Path, UseFormRegister } from 'react-hook-form'

interface LabelledInputProps {
    labelValue: string
    inputType: InputTypes,
    name: string,
    placeholder: string,
    value: any,
    register: UseFormRegister<any>,
    errorMessage?: string
}

const LabelledInput: React.FC<LabelledInputProps> = ({ labelValue, inputType, name, placeholder, value, register, errorMessage
}: LabelledInputProps) => {
    return (
        <>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">{labelValue}</label>
            <input type={inputType} id="name" className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-700 dark:focus:ring-blue-500 dark:focus:border-blue-500" value={value} placeholder={placeholder} {...register(name as Path<any>)} />
            <p className="text-red-500 text-sm">
                {errorMessage}
            </p>
        </>
    )
}

export default LabelledInput