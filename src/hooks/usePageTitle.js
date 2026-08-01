import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = `${title} | DSA Lab`
    return () => { document.title = 'DSA Lab' }
  }, [title])
}