export interface KeyboardShortcut {
  id: "goRoi" | "goSolution" | "openHelp"
  keys: string[]
  sequence: string
  route?: string
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "goRoi",
    keys: ["G", "R"],
    sequence: "g r",
    route: "/roi",
  },
  {
    id: "goSolution",
    keys: ["G", "S"],
    sequence: "g s",
    route: "/solucion",
  },
  {
    id: "openHelp",
    keys: ["?"],
    sequence: "?",
  },
]
