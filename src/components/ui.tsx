import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-surface p-5 ${className}`}>{children}</section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

const controlClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-leaf-strong";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${controlClass} ${className}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${controlClass} min-h-24 ${className}`} />;
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex min-h-12 items-center justify-center rounded-2xl bg-leaf px-5 py-3 font-medium text-foreground transition-colors hover:bg-leaf-strong disabled:opacity-60 ${className}`}
    />
  );
}

export function Choice({
  active = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      aria-pressed={active}
      className={`min-h-12 rounded-2xl px-4 py-3 font-medium ${
        active ? "bg-leaf ring-2 ring-foreground" : "border border-line bg-white"
      } ${className}`}
    />
  );
}
