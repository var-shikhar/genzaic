import { useEffect, useState } from "react"

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * have passed without further changes. Useful for search inputs that drive
 * RTK Query calls — prevents one network request per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
