import { FormControl, FormErrorMessage, FormLabel, Input } from '@sk-web-gui/react';
import React, { useState } from 'react';
import { CountryCodeSelect } from '@sk-web-gui/countrycode-select';
import { useFormContext } from 'react-hook-form';
import { toNationalPhoneNumber } from '@utils/format-phone-number';
import { useTranslation } from 'react-i18next';

interface ConnectFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: (methods: ReturnType<typeof useFormContext>) => React.ReactElement;
}

export const ConnectForm: React.FC<ConnectFormProps> = ({ children }) => {
  const methods = useFormContext();

  return typeof children === 'function' ? children({ ...methods }) : null;
};

interface ConnectFormInputProps {
  name: string;
  header: React.ReactNode;
  children?: React.ReactNode | ((methods: ReturnType<typeof useFormContext>) => React.ReactElement);
  inputProps?: React.ComponentPropsWithRef<typeof Input.Component>;
}

export const ConnectFormInput: React.FC<ConnectFormInputProps> = ({ name, header, children, inputProps }) => {
  const methods = useFormContext();
  const { t } = useTranslation('profile');
  const { errors, touchedFields, isSubmitted, submitCount } = methods.formState;
  const isPhoneField = name.includes('phone');
  const [editingAtSubmitCount, setEditingAtSubmitCount] = useState<number | null>(null);
  const isEditingPhone = editingAtSubmitCount === submitCount;
  const showPhoneError =
    !!errors?.phoneNumber?.message && (!!touchedFields?.phoneNumber || isSubmitted) && !isEditingPhone;
  const phoneNumberField = isPhoneField
    ? methods.register(`${name}Number`, {
        onChange: () => setEditingAtSubmitCount(submitCount),
        onBlur: () => setEditingAtSubmitCount(null),
      })
    : undefined;

  return (
    <FormControl id={name} className="w-full">
      {children && typeof children === 'function' ? (
        <>
          <FormLabel>{header}</FormLabel>
          {children({ ...methods })}
        </>
      ) : (
        <>
          <FormLabel>{header}</FormLabel>
          {isPhoneField ? (
            <>
              <Input.Group className="sm:max-w-[33.8rem] max-w-[12rem]" size="md">
                <Input.LeftAddon>
                  <CountryCodeSelect
                    className="sm:max-w-[33.8rem] max-w-[8rem]"
                    defaultValue="SE+46"
                    countries={['SE']}
                    {...methods.register(`${name}CountryCode`)}
                  />
                </Input.LeftAddon>
                <Input
                  {...phoneNumberField}
                  defaultValue={toNationalPhoneNumber(methods.getValues(`${name}`))}
                  placeholder="0701234567"
                  aria-label="Telefonnummer"
                />
              </Input.Group>
              {showPhoneError ? (
                <div className="my-sm">
                  <FormErrorMessage className="text-error">
                    {t(methods.formState.errors?.phoneNumber?.message as string)}
                  </FormErrorMessage>
                </div>
              ) : null}
              {children}
            </>
          ) : (
            <div className="w-full">
              <Input className="w-full sm:max-w-[33.8rem] max-w-[20rem]" {...methods.register(name)} {...inputProps} />
              {children}
            </div>
          )}
        </>
      )}
      {methods.formState.errors?.[name]?.message ? (
        <div className="my-sm">
          <FormErrorMessage className="text-error">
            {t(methods.formState.errors?.[name]?.message as string)}
          </FormErrorMessage>
        </div>
      ) : null}
    </FormControl>
  );
};
