import { useContext } from "react";

import { MainContext } from "@/pages/main/context";

export const useMainContext = () => useContext(MainContext);
