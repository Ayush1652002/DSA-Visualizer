import { useEffect } from 'react'

export function useKeyboardShortcuts({ onPlayPause, onNext, onPrev, onReset }) {
  useEffect(() => {
    function handler(e) {
      if (e.target.tagName === 'INPUT') return
      if (e.key === ' ')          { e.preventDefault(); onPlayPause?.() }
      if (e.key === 'ArrowRight') { e.preventDefault(); onNext?.() }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); onPrev?.() }
      if (e.key === 'r' || e.key === 'R') onReset?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPlayPause, onNext, onPrev, onReset])
}