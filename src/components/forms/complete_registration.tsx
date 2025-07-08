import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { SPACINGS } from "@a-novel/neon-ui";
import { MaterialSymbol, Section, StatusPage } from "@a-novel/neon-ui/ui";
import { PasswordInput, TanstackFormWrapper } from "@a-novel/neon-ui/ux";
import { useTolgeeNamespaces } from "@a-novel/tanstack-start-config";

import { Typography, Stack, Button } from "@mui/material";
import {
  type FormAsyncValidateOrFn,
  type FormValidateOrFn,
  type ReactFormExtendedApi,
  useStore,
} from "@tanstack/react-form";
import { T } from "@tolgee/react";

export interface CompleteRegistrationFormData {
  password: string;
  passwordConfirmation: string;
}

export interface CompleteRegistrationFormConnector<
  TOnMount extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnChange extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnBlur extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TSubmitMeta,
> {
  form: ReactFormExtendedApi<
    CompleteRegistrationFormData,
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
  toDashboard: () => void;
  isLinkError: boolean;
}

export interface CompleteRegistrationFormProps<
  TOnMount extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnChange extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnBlur extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TSubmitMeta,
> {
  connector: CompleteRegistrationFormConnector<
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

export function CompleteRegistrationForm<
  TOnMount extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnChange extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnBlur extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<CompleteRegistrationFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<CompleteRegistrationFormData>,
  TSubmitMeta,
>({
  connector,
}: CompleteRegistrationFormProps<
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
          <T keyName="register.form.invalid.title" ns="platform.authentication.ext" />
        </Typography>
        <Typography textAlign="center">
          <T keyName="register.form.invalid.main" ns="platform.authentication.ext" />
        </Typography>
      </StatusPage>
    );
  }

  if (isSubmitSuccessful) {
    return (
      <StatusPage color="success" icon={<MaterialSymbol icon="account_circle" />}>
        <Typography variant="h4" component="h1" color="success" textAlign="center">
          <T keyName="register.form.success.title" ns="platform.authentication.ext" />
        </Typography>
        <Typography textAlign="center">
          <T keyName="register.form.success.main" ns="platform.authentication.ext" />
        </Typography>
        <br />
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={SPACINGS.MEDIUM}>
          <Button type="button" color="success" variant="gradient-glow" onClick={() => connector.toDashboard()}>
            <T keyName="register.form.success.action" ns="platform.authentication.ext" />
          </Button>
        </Stack>
      </StatusPage>
    );
  }

  return (
    <Section direction="column" maxWidth="100%" gap={SPACINGS.LARGE}>
      <Typography variant="h3" color="primary" alignSelf="stretch" textAlign="center">
        <T keyName="register.title" ns="platform.authentication.ext" />
      </Typography>

      <TanstackFormWrapper
        form={connector.form}
        submitButton={(isSubmitting) => (
          <T
            keyName={isSubmitting ? "register.form.submitting" : "register.form.submit"}
            ns="platform.authentication.ext"
          />
        )}
      >
        <connector.form.Field name="password">
          {(field) => (
            <PasswordInput
              field={field}
              label={<T keyName="fields.password.label" ns="form" />}
              maxLength={BINDINGS_VALIDATION.PASSWORD.MAX}
            />
          )}
        </connector.form.Field>
        <connector.form.Field name="passwordConfirmation">
          {(field) => (
            <PasswordInput
              field={field}
              label={<T keyName="register.fields.passwordConfirmation.label" ns="platform.authentication.ext" />}
              maxLength={BINDINGS_VALIDATION.PASSWORD.MAX}
            />
          )}
        </connector.form.Field>
      </TanstackFormWrapper>
    </Section>
  );
}
