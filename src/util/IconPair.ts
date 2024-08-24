import { IconType } from 'react-icons'
import { FaBookmark, FaHome } from 'react-icons/fa'

interface IconMap {
  [key: string]: IconType
}

export const IconsPair: IconMap = {
  FaBookmark: FaBookmark,
  FaHome: FaHome
}
