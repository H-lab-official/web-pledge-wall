import React from 'react'
import { motion } from 'framer-motion'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  containerClassName?: string
  shake?: boolean
}

const baseTextareaClass =
  'h-40 rounded-2xl border-2 border-gray-300 bg-black/20 pl-8 pr-5 py-5 text-base leading-relaxed text-[#2f1b41] text-center'

const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  containerClassName = '',
  className = '',
  shake = false,
  ...rest
}) => {
  const shakeAnimation = shake ? {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 }
  } : {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onAnimationStart, onDrag, onDragStart, onDragEnd, ...textareaProps } = rest

  return (
    <label className={`flex w-full flex-col gap-2 ${containerClassName}`}>
      <span className="text-sm font-medium text-[#4a375f] text-center">{label}</span>
      <motion.textarea
        animate={shakeAnimation}
        className={`${baseTextareaClass} ${className}`}
        {...textareaProps}
      />
    </label>
  )
}

export default FormTextarea
