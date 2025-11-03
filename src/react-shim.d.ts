declare module 'react' {
  export type FormEvent<T = any> = any
  export type ChangeEvent<T = any> = { target: T; currentTarget: T }
  export type Dispatch<A> = (value: A | ((prev: A) => A)) => void
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<S>]
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void
  export function useMemo<T>(factory: () => T, deps: any[]): T
  export function useRef<T>(initialValue: T): { current: T }
  export type FC<P = {}> = (props: P) => any
  const React: any
  export default React
}

declare module 'react-dom/client' {
  const ReactDOM: {
    createRoot: (container: any) => { render: (node: any) => void }
  }
  export default ReactDOM
}

declare module 'react/jsx-runtime' {
  export const jsx: any
  export const jsxs: any
  export const Fragment: any
}
