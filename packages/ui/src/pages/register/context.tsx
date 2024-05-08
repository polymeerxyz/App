import { createContext, PropsWithChildren, useState } from "react";

type RegisterContextType = PropsWithChildren<{
  password: string;
  updatePassword: (password: string) => void;
}>

export const RegisterContext = createContext<RegisterContextType>({} as any);

export const RegisterContextProvider = (props: PropsWithChildren) => {
  const [password, updatePassword] = useState("");
  return <RegisterContext.Provider value={{ password, updatePassword }}>{props.children}</RegisterContext.Provider>;
};
