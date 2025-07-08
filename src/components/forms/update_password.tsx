import {
  BINDINGS_VALIDATION,
  UpdatePasswordForm as UpdatePasswordRequest,
} from "@a-novel/connector-authentication/api";
import { SPACINGS } from "@a-novel/neon-ui";
import { MaterialSymbol, Modal, Section } from "@a-novel/neon-ui/ui";
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
import { z } from "zod";

export interface UpdatePasswordFormData extends z.infer<typeof UpdatePasswordRequest> {
  passwordConfirmation: string;
}

export interface UpdatePasswordFormConnector<
  TOnMount extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnChange extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnBlur extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TSubmitMeta,
> {
  form: ReactFormExtendedApi<
    UpdatePasswordFormData,
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

export interface UpdatePasswordFormProps<
  TOnMount extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnChange extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnBlur extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TSubmitMeta,
> {
  connector: UpdatePasswordFormConnector<
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

export function UpdatePasswordForm<
  TOnMount extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnChange extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnBlur extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<UpdatePasswordFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<UpdatePasswordFormData>,
  TSubmitMeta,
>({
  connector,
}: UpdatePasswordFormProps<
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
  useTolgeeNamespaces("platform.authentication.account");

  const isSubmitSuccessful = useStore(connector.form.store, (state) => state.isSubmitSuccessful);

  return (
    <Section direction="column" maxWidth="100%" boxSizing="border-box" gap={SPACINGS.LARGE}>
      <Typography variant="h3" color="primary" alignSelf="stretch">
        <T keyName="updatePassword.title" ns="platform.authentication.account" />
      </Typography>

      <TanstackFormWrapper
        form={connector.form}
        submitButton={(isSubmitting) => (
          <T
            keyName={isSubmitting ? "updatePassword.form.submitting" : "updatePassword.form.submit"}
            ns="platform.authentication.account"
          />
        )}
      >
        <connector.form.Field name="currentPassword">
          {(field) => (
            <PasswordInput
              field={field}
              label={<T keyName="updatePassword.fields.currentPassword.label" ns="platform.authentication.account" />}
              maxLength={BINDINGS_VALIDATION.PASSWORD.MAX}
            />
          )}
        </connector.form.Field>
        <connector.form.Field name="password">
          {(field) => (
            <PasswordInput
              field={field}
              label={<T keyName="updatePassword.fields.newPassword.label" ns="platform.authentication.account" />}
              maxLength={BINDINGS_VALIDATION.PASSWORD.MAX}
            />
          )}
        </connector.form.Field>
        <connector.form.Field name="passwordConfirmation">
          {(field) => (
            <PasswordInput
              field={field}
              label={
                <T keyName="updatePassword.fields.newPasswordConfirmation.label" ns="platform.authentication.account" />
              }
              maxLength={BINDINGS_VALIDATION.PASSWORD.MAX}
            />
          )}
        </connector.form.Field>
      </TanstackFormWrapper>

      <Modal
        title={<T keyName="updatePassword.form.success.title" ns="platform.authentication.account" />}
        icon={<MaterialSymbol icon="encrypted" />}
        open={isSubmitSuccessful}
      >
        <Typography sx={{ "> strong": { color: (theme) => theme.palette.primary.main } }}>
          <T keyName="updatePassword.form.success.main" ns="platform.authentication.account" />
        </Typography>
        <br />
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={SPACINGS.MEDIUM}>
          <Button type="button" color="primary" onClick={() => connector.form.reset()}>
            <T keyName="updatePassword.form.success.action" ns="platform.authentication.account" />
          </Button>
        </Stack>
      </Modal>
    </Section>
  );
}
