import { FormControl, FormErrorMessage, FormLabel, Input } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import React from 'react';
import { CountryCodeSelect } from '@sk-web-gui/countrycode-select';

export const ConnectForm = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};

interface ConnectFormInputProps {
  name: string;
  header: React.ReactNode;
  children?: React.ReactNode | ((methods: ReturnType<typeof useFormContext>) => React.ReactElement);
  inputProps?: React.ComponentPropsWithRef<typeof Input.Component>;
}

export const ConnectFormInput: React.FC<ConnectFormInputProps> = ({ name, header, children, inputProps }) => {
  const methods = useFormContext();

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
          {name.includes('phone') ? (
            <>
              <Input.Group className="sm:max-w-[33.8rem] max-w-[12rem]" size="md">
                <Input.LeftAddon>
                  <CountryCodeSelect
                    className="sm:max-w-[33.8rem] max-w-[8rem]"
                    defaultValue="SE"
                    countries={['SE']}
                    {...methods.register(`${name}CountryCode`)}
                  />
                </Input.LeftAddon>
                <Input
                  {...methods.register(`${name}Number`)}
                  defaultValue={methods.getValues(`${name}`)?.substring(3) ?? ''}
                  placeholder="701234567"
                  aria-label="Telefonnummer"
                />
              </Input.Group>
              {methods.formState.errors?.phoneNumber?.message ? (
                <div className="my-sm">
                  <FormErrorMessage className="text-error">
                    {(methods.formState.errors?.phoneNumber?.message as string) ?? ''}
                  </FormErrorMessage>
                </div>
              ) : methods.formState.errors?.['contactSetting']?.['phoneNumber']?.message ? (
                <div className="my-sm">
                  <FormErrorMessage className="text-error">
                    {(methods.formState.errors?.['contactSetting']?.['phoneNumber']?.message as string) ?? ''}
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
            {(methods.formState.errors?.[name]?.message as string) ?? ''}
          </FormErrorMessage>
        </div>
      ) : null}
    </FormControl>
  );
};
