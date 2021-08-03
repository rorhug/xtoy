// note PromiseLike instead of Promise, this lets it work on any thenable
export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
