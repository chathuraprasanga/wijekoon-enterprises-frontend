import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';

export interface ResetPasswordWizardContext {
  identifier: string;
  resetToken: string;
  cooldownEndsAt: number | null;
  setIdentifier: (value: string) => void;
  setResetToken: (value: string) => void;
  setCooldownEndsAt: (value: number | null) => void;
}

export const ResetPasswordWizardLayout = () => {
  const [identifier, setIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);

  const context: ResetPasswordWizardContext = {
    identifier,
    resetToken,
    cooldownEndsAt,
    setIdentifier,
    setResetToken,
    setCooldownEndsAt,
  };

  return (
    <AuthLayout>
      <Outlet context={context} />
    </AuthLayout>
  );
};
