import { useEffect, useState } from "react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export function useKonami(callback: () => void) {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const newKeys = [...keys, e.code].slice(-10);
      setKeys(newKeys);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setKeys([]);
      }, 3000);

      if (newKeys.join(",") === KONAMI_CODE.join(",")) {
        callback();
        setKeys([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [keys, callback]);

  return keys.length > 0;
}
