export type ClassStruct<T extends any = any> = new (...args: any[]) => T

export interface IDisposed {
  dispose(): void
}
