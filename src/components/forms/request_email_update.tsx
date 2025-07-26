import type { RequestEmailUpdateFormConnector } from "~/connectors/forms";

import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { MaterialSymbol, Section, Modal } from "@a-novel/package-ui/mui/components";
import { SPACINGS } from "@a-novel/package-ui/mui/utils";
import { EmailInput, TanstackFormWrapper } from "@a-novel/package-ui/tanstack/form";
import { WithTolgeeNs } from "@a-novel/package-ui/translations";

import { Typography, Stack, Button } from "@mui/material";
import { useStore } from "@tanstack/react-form";
import { T, useTranslate } from "@tolgee/react";

export const RequestEmailUpdateForm = WithTolgeeNs(InnerRequestEmailUpdateForm, [
  "form",
  "platform.authentication.account",
]);

export interface RequestEmailUpdateFormProps {
  connector: RequestEmailUpdateFormConnector;
}

function InnerRequestEmailUpdateForm({ connector }: RequestEmailUpdateFormProps) {
  const { t } = useTranslate("form");

  const isSubmitSuccessful = useStore(connector.form.store, (state) => state.isSubmitSuccessful);
  const userEmail = useStore(connector.form.store, (state) => state.values.email);

  return (
    <Section direction="column" maxWidth="100%" gap={SPACINGS.LARGE}>
      <Typography variant="h2" color="primary" alignSelf="stretch">
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
          <Button type="button" color="primary" onClick={() => connector.form.reset()} sx={{ minWidth: "20ch" }}>
            <T keyName="requestEmailUpdate.form.success.action" ns="platform.authentication.account" />
          </Button>
        </Stack>
      </Modal>
    </Section>
  );
}
