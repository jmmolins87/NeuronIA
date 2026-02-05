let lockCount = 0

let prevHtmlOverflow: string | null = null
let prevBodyOverflow: string | null = null
let prevBodyPaddingRight: string | null = null

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth
}

export function lockScroll(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {}

  lockCount += 1

  if (lockCount === 1) {
    prevHtmlOverflow = document.documentElement.style.overflow
    prevBodyOverflow = document.body.style.overflow
    prevBodyPaddingRight = document.body.style.paddingRight

    const scrollbarWidth = getScrollbarWidth()
    if (scrollbarWidth > 0) {
      const computedPadding = Number.parseFloat(
        window.getComputedStyle(document.body).paddingRight || "0"
      )
      document.body.style.paddingRight = `${computedPadding + scrollbarWidth}px`
    }

    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    window.dispatchEvent(
      new CustomEvent("clinvetia:scroll-lock", { detail: { locked: true } })
    )
  }

  return () => {
    if (typeof window === "undefined" || typeof document === "undefined") return

    lockCount = Math.max(0, lockCount - 1)
    if (lockCount !== 0) return

    document.documentElement.style.overflow = prevHtmlOverflow ?? ""
    document.body.style.overflow = prevBodyOverflow ?? ""
    document.body.style.paddingRight = prevBodyPaddingRight ?? ""

    prevHtmlOverflow = null
    prevBodyOverflow = null
    prevBodyPaddingRight = null

    window.dispatchEvent(
      new CustomEvent("clinvetia:scroll-lock", { detail: { locked: false } })
    )
  }
}
