import { FormControl, FormErrorMessage, FormLabel, Input } from '@sk-web-gui/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

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
          <Input {...methods.register(name)} {...inputProps} />
          {children}
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
