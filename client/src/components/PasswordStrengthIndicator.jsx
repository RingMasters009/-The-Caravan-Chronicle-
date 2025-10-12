import React from 'react';

const PasswordRequirement = ({ isValid, text }) => (
  <li className={`flex items-center transition-colors ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isValid ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
    </svg>
    {text}
  </li>
);

const PasswordStrengthIndicator = ({ password }) => {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  const isLongEnough = password.length >= 8;

  return (
    <ul className="text-sm space-y-1 mt-2">
      <PasswordRequirement isValid={isLongEnough} text="At least 8 characters" />
      <PasswordRequirement isValid={hasLowerCase} text="Contains a lowercase letter" />
      <PasswordRequirement isValid={hasUpperCase} text="Contains an uppercase letter" />
      <PasswordRequirement isValid={hasNumber} text="Contains a number" />
      <PasswordRequirement isValid={hasSpecialChar} text="Contains a special character (@$!%*?&)" />
    </ul>
  );
};

export default PasswordStrengthIndicator;
