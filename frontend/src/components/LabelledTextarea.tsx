import { Textarea } from '@headlessui/react'
import React from 'react'
import { Path, UseFormRegister } from 'react-hook-form'

interface LabelledTextareaProps {
    labelValue: string,
    name: string
    placeholder: string,
    value: any,
    register: UseFormRegister<any>,
    errorMessage?: string
}

const LabelledTextarea: React.FC<LabelledTextareaProps> = ({ labelValue, name, placeholder, value, register, errorMessage
}: LabelledTextareaProps) => {
    return (
        <>
            <label htmlFor="details" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">{labelValue}</label>
            <Textarea id="details" className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-700 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={placeholder} value={value}{...register(name as Path<any>)} />
            <p className="text-red-500 text-sm">
                {errorMessage}
            </p>
        </>
    )
}

export default LabelledTextarea