import { useContext } from "react";

import { AppContext } from "@/routes/context";

export const useAppContext = () => useContext(AppContext);
