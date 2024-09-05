type TextButtonProps = {
  styles?: string | null
  children?: React.ReactNode
  onClick: () => void
}

export const TextButton = (props: TextButtonProps) => {
  const { styles, onClick, children } = props
  const styleList: string[] = ['text-gray-500', 'text-[14pt]', 'p-1', styles ?? '']
  return (
    <>
      <button type="button" onClick={onClick} className={styleList.join(' ').trim()}>
        {children}
      </button>
    </>
  )
}
