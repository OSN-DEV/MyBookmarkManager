import { ReactNode, createContext, useContext, useState } from 'react'

interface CategoryIdContextType {
  id: number
  setId: (id: number) => void
  getId: () => number
}

export const CategoryIdContext = createContext<CategoryIdContextType | undefined>(undefined)

interface CategoryIdProviderProps {
  children: ReactNode
}

export const CategoryIdProvider = ({ children }: CategoryIdProviderProps): JSX.Element => {
  const [id, setId] = useState<number>(-1)

  const getId = (): number => id
  return <CategoryIdContext.Provider value={{ id, setId, getId }}>{children}</CategoryIdContext.Provider>
}

export const useCategoryIdContext = (): CategoryIdContextType => {
  const context = useContext(CategoryIdContext)
  if (!context) {
    throw new Error('useCategoryIdContext must be used within a CategoryIDProvider')
  }
  return context
}
