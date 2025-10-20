"use client";

type ProgressStep = {
  id: number;
  title: string;
  status: "completed" | "current" | "pending";
};

type ProgressIndicatorProps = {
  currentStep: number;
};

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps: ProgressStep[] = [
    { id: 1, title: "Select Flight", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "pending" },
    { id: 2, title: "Booking Details", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "pending" },
    { id: 3, title: "Payment", status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "pending" },
  ];

  return (
    <div className="bg-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.status === "completed" 
                  ? "bg-blue-600 text-white" 
                  : step.status === "current" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-300 text-gray-600"
              }`}>
                {step.status === "completed" ? "✓" : step.id}
              </div>
              
              {/* Step Title */}
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  step.status === "completed" || step.status === "current"
                    ? "text-blue-600" 
                    : "text-gray-500"
                }`}>
                  {step.title}
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  step.status === "completed" ? "bg-blue-600" : "bg-gray-300"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
