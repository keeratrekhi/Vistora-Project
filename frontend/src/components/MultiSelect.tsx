import React from 'react'
import { MutliSelectOption } from '../common/types'
import { Path, UseFormRegister } from 'react-hook-form';

interface MultiSelectProps {
    id: string,
    labelValue: string,
    value: any,
    name: string,
    register: UseFormRegister<any>,
    options?: MutliSelectOption[]
}

const MultiSelect: React.FC<MultiSelectProps> = ({ id, labelValue, value, name, register, options }: MultiSelectProps) => {
    if (!options)
        options = [];

    return (
        <>
            <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">{labelValue}</label>
            <select id={id} className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-700 dark:focus:ring-blue-500 dark:focus:border-blue-500" value={value} {...register(name as Path<any>, { valueAsNumber: true })}>
                {
                    options.map((option) => (
                        <option key={option.value} value={option.value} selected={option.isSelected}>{option.label}</option>
                    ))
                }
            </select>
        </>
    )
}

export default MultiSelect