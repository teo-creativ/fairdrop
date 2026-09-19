type FormFieldProps = {
  /** Courte légende affichée sous le champ. */
  caption: string;
  children: React.ReactNode;
};

/** Champ de formulaire + légende explicative (voir /admin). */
export function FormField({ caption, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {children}
      <p className="text-muted text-xs px-1">{caption}</p>
    </div>
  );
}
