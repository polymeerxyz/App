import { useMemo } from "react";
import { useWindowSize } from "react-use";

export const useIsPopup = () => {
  const { height, width } = useWindowSize();
  return useMemo(() => width === 400 && height === 600, [height, width]);
};
