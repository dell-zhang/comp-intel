"use client";

import { Check, Database, FileText, Newspaper, Search } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Discovering", sublabel: "competitors", icon: Search },
  { label: "Gathering", sublabel: "data", icon: Database },
  { label: "Analyzing", sublabel: "news", icon: Newspaper },
  { label: "Generating", sublabel: "report", icon: FileText },
];

interface ProgressStepperProps {
  currentStep: number;
  isComplete: boolean;
}

export function ProgressStepper({
  currentStep,
  isComplete,
}: ProgressStepperProps) {
  return (
    <div className="fade-up mx-auto w-full max-w-2xl">
      <div className="flex items-start">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const done = isComplete || currentStep > stepNum;
          const active = !isComplete && currentStep === stepNum;
          const Icon = step.icon;

          return (
            <Fragment key={step.label}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-all duration-300 sm:size-10",
                    done && "bg-indigo-600 text-white shadow-sm",
                    active &&
                      "border-2 border-indigo-500 bg-indigo-50 text-indigo-600 ring-4 ring-indigo-500/10",
                    !done &&
                      !active &&
                      "border-2 border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {done ? (
                    <Check className="size-4" />
                  ) : (
                    <Icon className={cn("size-4", active && "animate-pulse")} />
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-[11px] font-medium transition-colors sm:text-xs",
                      done
                        ? "text-indigo-600"
                        : active
                          ? "text-slate-900"
                          : "text-slate-400",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="hidden text-[10px] text-slate-400 sm:block">
                    {step.sublabel}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="mt-[18px] flex-1 px-2 sm:mt-5 sm:px-3">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded-full transition-colors duration-500",
                      done ? "bg-indigo-600" : "bg-slate-200",
                    )}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
