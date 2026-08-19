import { Label } from '@sk-web-gui/react';
import React from 'react';

export const InvoiceLabel: React.FC<{
  invoiceStatus: { code: string; color: string; label: string };
}> = ({ invoiceStatus }) => {
  return (
    <Label
      rounded
      inverted={invoiceStatus?.color !== 'neutral'}
      color={invoiceStatus?.color}
      data-cy="invoice-status-label"
    >
      {invoiceStatus?.label}
    </Label>
  );
};
