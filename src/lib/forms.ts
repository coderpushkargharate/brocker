import { startTransition, useEffect, useRef, type FormEvent } from "react";

/**
 * onSubmit handler for forms driven by useActionState.
 *
 * With <form action={action}>, React 19 resets every uncontrolled field after the action finishes – even when
 * the server only returned a validation error – so visitors lose everything they typed. Dispatching the action
 * from onSubmit keeps the values, and building FormData with the submitter keeps the clicked button's
 * name/value (e.g. "Save draft" vs "Publish").
 */
export function keepValues(action: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const fd = submitter ? new FormData(e.currentTarget, submitter) : new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
}

/** For "add new" style forms: clear the fields after a successful save (pass the useActionState state). */
export function useResetOnSuccess(state: { ok?: string } | undefined, enabled = true) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (enabled && state?.ok) ref.current?.reset();
  }, [state, enabled]);
  return ref;
}
