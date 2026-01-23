import { cn } from "@/lib/utils";

export const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section className={cn("p-4 border-2 rounded-lg", className)}>
      {children}
    </section>
  );
};
