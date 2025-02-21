import React from 'react';

function Stepper({ currentStep, steps }) {
  return (
    <div className="flex justify-center mb-5">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold 
            ${index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            {index + 1}
          </div>
          <span className={`mx-2 text-sm ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>{step}</span>
          {index < steps.length - 1 && <div className="w-10 h-1 bg-gray-300"></div>}
        </div>
      ))}
    </div>
  );
}

export default Stepper;
