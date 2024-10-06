export type TItem = {
  categoryId: number
  id: number
  title: string
  sort: number
  url: string
  explanation: string
  note: string
}

export const initialItem = {
  categoryId: 0,
  id: 0,
  title: '',
  sort: 0,
  url: '',
  explanation: '',
  note: ''
}