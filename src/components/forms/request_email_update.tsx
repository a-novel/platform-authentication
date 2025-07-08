import {
  BINDINGS_VALIDATION,
  RequestEmailUpdateForm as RequestEmailUpdateRequest,
} from "@a-novel/connector-authentication/api";
import { SPACINGS } from "@a-novel/neon-ui";
import { MaterialSymbol, Modal, Section } from "@a-novel/neon-ui/ui";
import { EmailInput, TanstackFormWrapper } from "@a-novel/neon-ui/ux";
import { useTolgeeNamespaces } from "@a-novel/tanstack-start-config";

import { Typography, Stack, Button } from "@mui/material";
import {
  type FormAsyncValidateOrFn,
  type FormValidateOrFn,
  type ReactFormExtendedApi,
  useStore,
} from "@tanstack/react-form";
import { T, useTranslate } from "@tolgee/react";
import { z } from "zod";

export interface RequestEmailUpdateFormConnector<
  TOnMount extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnChange extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnBlur extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnSubmit extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnServer extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TSubmitMeta,
> {
  form: ReactFormExtendedApi<
    z.infer<typeof RequestEmailUpdateRequest>,
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
  currentEmail: string;
}

export interface RequestEmailUpdateFormProps<
  TOnMount extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnChange extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnBlur extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnSubmit extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnServer extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TSubmitMeta,
> {
  connector: RequestEmailUpdateFormConnector<
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

export function RequestEmailUpdateForm<
  TOnMount extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnChange extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnBlur extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnSubmit extends undefined | FormValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TOnServer extends undefined | FormAsyncValidateOrFn<z.infer<typeof RequestEmailUpdateRequest>>,
  TSubmitMeta,
>({
  connector,
}: RequestEmailUpdateFormProps<
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
  const { t } = useTranslate("form");
  useTolgeeNamespaces("form");
  useTolgeeNamespaces("platform.authentication.account");

  const isSubmitSuccessful = useStore(connector.form.store, (state) => state.isSubmitSuccessful);
  const userEmail = useStore(connector.form.store, (state) => state.values.email);

  return (
    <Section direction="column" maxWidth="100%" gap={SPACINGS.LARGE}>
      <Typography variant="h3" color="primary" alignSelf="stretch">
        <T keyName="requestEmailUpdate.title" ns="platform.authentication.account" />
      </Typography>

      <TanstackFormWrapper
        form={connector.form}
        submitButtonProps={{ disabled: !connector.currentEmail || connector.currentEmail === userEmail }}
        submitButton={(isSubmitting) => (
          <T
            keyName={isSubmitting ? "requestEmailUpdate.form.submitting" : "requestEmailUpdate.form.submit"}
            ns="platform.authentication.account"
          />
        )}
      >
        <connector.form.Field name="email">
          {(field) => (
            <EmailInput
              disabled={!connector.currentEmail}
              field={field}
              label={<T keyName="fields.email.label" ns="form" />}
              placeholder={t("fields.email.placeholder", { ns: "form" })}
              helperText={<T keyName="requestEmailUpdate.fields.email.helper" ns="platform.authentication.account" />}
              maxLength={BINDINGS_VALIDATION.EMAIL.MAX}
            />
          )}
        </connector.form.Field>
      </TanstackFormWrapper>

      <Modal
        title={<T keyName="requestEmailUpdate.form.success.title" ns="platform.authentication.account" />}
        icon={<MaterialSymbol icon="mark_email_read" />}
        open={isSubmitSuccessful}
      >
        <Typography sx={{ "> strong": { color: (theme) => theme.palette.primary.main } }}>
          <T
            keyName="requestEmailUpdate.form.success.main"
            ns="platform.authentication.account"
            params={{ mail: userEmail, strong: <strong /> }}
          />
        </Typography>
        <br />
        <Typography color="textSecondary">
          <T keyName="requestEmailUpdate.form.success.sub" ns="platform.authentication.account" />
        </Typography>
        <br />
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={SPACINGS.MEDIUM}>
          <Button type="button" color="primary" onClick={() => connector.form.reset()}>
            <T keyName="requestEmailUpdate.form.success.action" ns="platform.authentication.account" />
          </Button>
        </Stack>
      </Modal>
    </Section>
  );
}
