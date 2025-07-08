import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { SPACINGS } from "@a-novel/neon-ui";
import { MaterialSymbol, Section, StatusPage } from "@a-novel/neon-ui/ui";
import { PasswordInput, TanstackFormWrapper } from "@a-novel/neon-ui/ux";
import { useTolgeeNamespaces } from "@a-novel/tanstack-start-config";

import { Typography } from "@mui/material";
import {
  type FormAsyncValidateOrFn,
  type FormValidateOrFn,
  type ReactFormExtendedApi,
  useStore,
} from "@tanstack/react-form";
import { T } from "@tolgee/react";

export interface CompletePasswordResetFormData {
  password: string;
  passwordConfirmation: string;
}

export interface CompletePasswordResetFormConnector<
  TOnMount extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnChange extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnBlur extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TSubmitMeta,
> {
  form: ReactFormExtendedApi<
    CompletePasswordResetFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnServer,
    TSubmitMeta
  >;
  isLinkError: boolean;
}

export interface CompletePasswordResetFormProps<
  TOnMount extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnChange extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnBlur extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TSubmitMeta,
> {
  connector: CompletePasswordResetFormConnector<
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnServer,
    TSubmitMeta
  >;
}

export function CompletePasswordResetForm<
  TOnMount extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnChange extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnBlur extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<CompletePasswordResetFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<CompletePasswordResetFormData>,
  TSubmitMeta,
>({
  connector,
}: CompletePasswordResetFormProps<
  TOnMount,
  TOnChange,
  TOnChangeAsync,
  TOnBlur,
  TOnBlurAsync,
  TOnSubmit,
  TOnSubmitAsync,
  TOnServer,
  TSubmitMeta
>) {
  useTolgeeNamespaces("form");
  useTolgeeNamespaces("platform.authentication.ext");

  const isSubmitSuccessful = useStore(connector.form.store, (state) => state.isSubmitSuccessful);

  if (connector.isLinkError) {
    return (
      <StatusPage color="error" icon={<MaterialSymbol icon="block" />}>
        <Typography variant="h4" component="h1" color="error" textAlign="center">
          <T keyName="resetPassword.form.invalid.title" ns="platform.authentication.ext" />
        </Typography>
        <Typography textAlign="center">
          <T keyName="resetPassword.form.invalid.main" ns="platform.authentication.ext" />
        </Typography>
      </StatusPage>
    );
  }

  if (isSubmitSuccessful) {
    return (
      <StatusPage color="success" icon={<MaterialSymbol icon="encrypted" />}>
        <Typography variant="h4" component="h1" color="success" textAlign="center">
          <T keyName="resetPassword.form.success.title" ns="platform.authentication.ext" />
        </Typography>
        <Typography textAlign="center">
          <T keyName="resetPassword.form.success.main" ns="platform.authentication.ext" />
        </Typography>
      </StatusPage>
    );
  }

  return (
    <Section direction="column" maxWidth="100%" gap={SPACINGS.LARGE}>
      <Typography variant="h3" color="primary" alignSelf="stretch" textAlign="center">
        <T keyName="resetPassword.title" ns="platform.authentication.ext" />
      </Typography>

      <TanstackFormWrapper
        form={connector.form}
        submitButton={(isSubmitting) => (
          <T
            keyName={isSubmitting ? "resetPassword.form.submitting" : "resetPassword.form.submit"}
            ns="platform.authentication.ext"
          />
        )}
      >
        <connector.form.Field name="password">
          {(field) => (
            <PasswordInput
              field={field}
              label={<T keyName="resetPassword.fields.newPassword.label" ns="platform.authentication.ext" />}
              maxLength={BINDINGS_VALIDATION.PASSWORD.MAX}
            />
          )}
        </connector.form.Field>
        <connector.form.Field name="passwordConfirmation">
          {(field) => (
            <PasswordInput
              field={field}
              label={
                <T keyName="resetPassword.fields.newPasswordConfirmation.label" ns="platform.authentication.ext" />
              }
              maxLength={BINDINGS_VALIDATION.PASSWORD.MAX}
            />
          )}
        </connector.form.Field>
      </TanstackFormWrapper>
    </Section>
  );
}
