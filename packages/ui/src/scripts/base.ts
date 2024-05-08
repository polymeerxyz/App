import browser from "webextension-polyfill";

type Listener<In, Out> = (params: In) => Out;

type Optional<T> = T extends object ? T : void;

type Messager<Request, Response> = {
  (payload: Optional<Request>): Response;
};

function createMessager<Request, Response>(type: string): Messager<Request, Response> {
  return (payload: Optional<Request>) => browser.runtime.sendMessage({ type, payload }) as Response;
}

export function createRuntimeService<Listeners extends Record<string, Listener<any, any>>>(params: {
  name: string;
  listeners: Listeners;
}) {
  const { name, listeners } = params;
  const messagers = Object.keys(listeners).reduce(
    (acc, key) => {
      (acc[key] as any) = createMessager(`${name}/${key}`);
      return acc;
    },
    {} as {
      [Type in keyof Listeners]: Messager<Parameters<Listeners[Type]>[0], ReturnType<Listeners[Type]>>;
    },
  );

  return {
    name,
    messagers,
    listen: (message: { type: string; payload: any }) => {
      const { type, payload } = message;
      const [_, key] = type.split("/");
      return listeners[key]?.(payload);
    },
  };
}
