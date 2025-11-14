import React from 'react'
import { motion } from 'framer-motion'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  containerClassName?: string
  shake?: boolean
}

const baseInputClass =
  'h-12 rounded-full border-2 border-gray-300 bg-black/20 px-8 py-3 text-[#2f1b41] leading-relaxed text-center'

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  containerClassName = '',
  className = '',
  shake = false,
  ...rest
}, ref) => {
  const shakeAnimation = shake ? {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 }
  } : {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onAnimationStart, onDrag, onDragStart, onDragEnd, ...inputProps } = rest

  return (
    <div className={`flex w-full flex-col gap-2 items-center ${containerClassName}`}>
      <label className="text-lg font-medium text-[#4a375f] text-center w-full">
        {label}
      </label>
      <motion.input
        ref={ref}
        animate={shakeAnimation}
        className={`${baseInputClass} ${className}`}
        {...inputProps}
      />
    </div>
  )
})

FormInput.displayName = 'FormInput'

export default FormInput
