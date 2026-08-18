export function PageHeader({title, subtitle}: Readonly<{title: string; subtitle: string}>) {
  return (
    <section className="animate-in-soft space-y-2 px-1 pt-1">
      <h1 className="text-[2rem] font-bold leading-[1.05] tracking-normal text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-2xl text-[15px] leading-6 text-muted-foreground">{subtitle}</p>
    </section>
  );
}
