import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadStepsProps {
  currentStep: number;
  steps: { id: number; label: string }[];
}

export function UploadSteps({ currentStep, steps }: UploadStepsProps) {
  return (
    <div className="relative flex justify-between w-full max-w-2xl mx-auto mb-8">
      {/* Connecting Line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300 ease-in-out"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center group">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                isCompleted
                  ? "border-primary bg-primary text-primary-foreground"
                  : isCurrent
                  ? "border-primary text-primary ring-4 ring-primary/20"
                  : "border-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <span
              className={cn(
                "absolute top-10 text-xs font-medium whitespace-nowrap transition-colors duration-300",
                isCurrent ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
