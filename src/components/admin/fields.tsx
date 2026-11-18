// Small form building blocks for the admin (no hooks: usable from client components).

type Common = { name: string; label: string; error?: string; hint?: string };

export function TextField({ name, label, error, hint, defaultValue, dir, required, type = "text", ...rest }: Common & { defaultValue?: string | number | null; dir?: "ltr" | "rtl"; required?: boolean; type?: string; placeholder?: string; min?: number; step?: number }) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label">{label}{required && <span className="text-accent-dark"> *</span>}</label>
      <input id={id} name={name} type={type} dir={dir} defaultValue={defaultValue ?? ""} className="field" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} {...rest} />
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm font-medium text-accent-dark">{error}</p>}
    </div>
  );
}

export function TextArea({ name, label, error, hint, defaultValue, dir, rows = 3, mono }: Common & { defaultValue?: string; dir?: "ltr" | "rtl"; rows?: number; mono?: boolean }) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <textarea id={id} name={name} dir={dir} rows={rows} defaultValue={defaultValue ?? ""} className={`field resize-y ${mono ? "font-mono text-sm" : ""}`} aria-invalid={!!error} />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-sm font-medium text-accent-dark">{error}</p>}
    </div>
  );
}

/** French + Arabic side by side (Arabic in RTL). */
export function L10nFields({ base, label, values, errors, multiline, rows, mono, required }: { base: string; label: string; values?: { fr: string; ar: string }; errors?: Record<string, string>; multiline?: boolean; rows?: number; mono?: boolean; required?: boolean }) {
  const F = multiline ? TextArea : TextField;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <F name={`${base}_fr`} label={`${label} (FR)`} defaultValue={values?.fr} error={errors?.[`${base}_fr`]} dir="ltr" rows={rows} mono={mono} required={required} />
      <F name={`${base}_ar`} label={`${label} (AR)`} defaultValue={values?.ar} error={errors?.[`${base}_ar`]} dir="rtl" rows={rows} mono={mono} required={required} />
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-[20px] bg-paper p-5 shadow-soft sm:p-6">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}

export function Notice({ result }: { result: { ok: boolean; message: string } | null }) {
  if (!result) return null;
  return (
    <p role={result.ok ? "status" : "alert"} className={`rounded-2xl px-4 py-3 text-sm font-medium ${result.ok ? "bg-success/10 text-success" : "bg-accent-dark/10 text-accent-dark"}`}>
      {result.message}
    </p>
  );
}
