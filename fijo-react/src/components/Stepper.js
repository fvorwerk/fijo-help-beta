import React from 'react';
import './Stepper.css';

function Stepper({ currentStep, steps }) {
  return (
    <div className="flex flex-col md:flex-row justify-center mb-5">
      {steps.map((step, index) => {
        const isCurrent = index === currentStep;
        const isPrevious = index === currentStep - 1;
        const isNext = index === currentStep + 1;
        const isVisible = isCurrent || isPrevious || isNext;

        return (
          <div
            key={index}
            className={`flex items-center mb-2 md:mb-0 stepper-step ${
              isVisible ? 'stepper-step-visible' : 'stepper-step-hidden'
            }`}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                isCurrent ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`mx-2 text-sm ${
                isCurrent ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className="hidden md:block w-10 h-1 bg-gray-300"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
