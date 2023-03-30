/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<
        Record<SafeAny, SafeAny>,
        Record<SafeAny, SafeAny>,
        SafeAny
    >;
    export default component;
}

declare module '*.css' {
    const value: SafeAny;
    export = value;
}

declare module '*.scss' {
    const value: SafeAny;
    export = value;
}
