import { useContext } from "react";

import { RegisterContext } from "@/pages/register/context";

export const useRegisterContext = () => useContext(RegisterContext);
