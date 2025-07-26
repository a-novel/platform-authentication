import type { UpdatePasswordFormConnector } from "~/connectors/forms";

import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { MaterialSymbol, Modal, Section } from "@a-novel/package-ui/mui/components";
import { SPACINGS } from "@a-novel/package-ui/mui/utils";
import { PasswordInput, TanstackFormWrapper } from "@a-novel/package-ui/tanstack/form";
import { WithTolgeeNs } from "@a-novel/package-ui/translations";

import { Typography, Stack, Button } from "@mui/material";
import { useStore } from "@tanstack/react-form";
import { T } from "@tolgee/react";

export const UpdatePasswordForm = WithTolgeeNs(InnerUpdatePasswordForm, ["form", "platform.authentication.account"]);

export interface UpdatePasswordFormProps {
  connector: UpdatePasswordFormConnector;
}

function InnerUpdatePasswordForm({ connector }: UpdatePasswordFormProps) {
  const isSubmitSuccessful = useStore(connector.form.store, (state) => state.isSubmitSuccessful);

  return (
    <Section direction="column" maxWidth="100%" boxSizing="border-box" gap={SPACINGS.LARGE}>
      <Typography variant="h2" color="primary" alignSelf="stretch">
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
          <Button type="button" color="primary" onClick={() => connector.form.reset()} sx={{ minWidth: "20ch" }}>
            <T keyName="updatePassword.form.success.action" ns="platform.authentication.account" />
          </Button>
        </Stack>
      </Modal>
    </Section>
  );
}
