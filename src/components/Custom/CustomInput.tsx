/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import CustomText from './CustomText'
import { useFormikContext } from 'formik';
import { Eye, EyeSlash } from 'iconsax-reactjs';
import { Input } from '@/components/ui/input'

interface IProps {
    name: string;
    label: string;
    isPassword?: boolean;
}

function CustomInput({ name, label, isPassword = false }: IProps) {
    const [isActive, setIsActive] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false);
    const { handleBlur, handleChange, errors, touched } = useFormikContext<any>();

    React.useEffect(() => {
        console.log(errors);
    }, [errors])

    // colors
    return (
        <div className='w-full flex items-start'>
            <CustomText type='REGULAR' fontSize='14' text={label} color="black" />
            <Input
                type={isPassword ? showPassword ? 'text' : 'password' : 'text'}
                name={name}
                id={name}
                onChange={handleChange}
                onBlur={(e) => {
                    setIsActive(false);
                    handleBlur(e);
                }}
                width='100%'
                height={'60px'}
                color="black"
                onClick={() => setIsActive(true)}
            />
            {errors[name] && touched[name] && (
                <CustomText type="LIGHT" fontSize='12px' text={errors[name as string] as string} color="error" />
            )}
        </div>
    )
}

export default CustomInput
