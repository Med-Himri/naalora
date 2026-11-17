"use client";

import { startTransition, type FormEvent } from "react";

/** Submit without React's automatic form reset, so typed values survive validation errors. */
export function keepFormSubmit(action: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
}
