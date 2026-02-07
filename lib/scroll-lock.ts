let lockCount = 0

let prevHtmlOverflow: string | null = null
let prevBodyOverflow: string | null = null
let prevBodyPaddingRight: string | null = null
let prevBodyPosition: string | null = null
let prevBodyTop: string | null = null
let prevBodyLeft: string | null = null
let prevBodyRight: string | null = null
let prevBodyWidth: string | null = null
let prevScrollY: number | null = null

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
    prevBodyPosition = document.body.style.position
    prevBodyTop = document.body.style.top
    prevBodyLeft = document.body.style.left
    prevBodyRight = document.body.style.right
    prevBodyWidth = document.body.style.width
    prevScrollY = window.scrollY

    const scrollbarWidth = getScrollbarWidth()
    if (scrollbarWidth > 0) {
      const computedPadding = Number.parseFloat(
        window.getComputedStyle(document.body).paddingRight || "0"
      )
      document.body.style.paddingRight = `${computedPadding + scrollbarWidth}px`
    }

    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    // iOS Safari: overflow hidden alone can still allow background scroll.
    // Freeze the page by fixing body at the current scroll position.
    document.body.style.position = "fixed"
    document.body.style.top = `-${prevScrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.width = "100%"

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

    document.body.style.position = prevBodyPosition ?? ""
    document.body.style.top = prevBodyTop ?? ""
    document.body.style.left = prevBodyLeft ?? ""
    document.body.style.right = prevBodyRight ?? ""
    document.body.style.width = prevBodyWidth ?? ""

    if (typeof prevScrollY === "number") {
      window.scrollTo(0, prevScrollY)
    }

    prevHtmlOverflow = null
    prevBodyOverflow = null
    prevBodyPaddingRight = null
    prevBodyPosition = null
    prevBodyTop = null
    prevBodyLeft = null
    prevBodyRight = null
    prevBodyWidth = null
    prevScrollY = null

    window.dispatchEvent(
      new CustomEvent("clinvetia:scroll-lock", { detail: { locked: false } })
    )
  }
}
