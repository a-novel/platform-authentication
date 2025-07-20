import type { CompleteRegistrationFormConnector } from "~/connectors/forms";

import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { MaterialSymbol, Section, StatusPage } from "@a-novel/package-ui/mui/components";
import { SPACINGS } from "@a-novel/package-ui/mui/utils";
import { PasswordInput, TanstackFormWrapper } from "@a-novel/package-ui/tanstack/form";
import { WithTolgeeNs } from "@a-novel/package-ui/translations";

import { Typography, Stack, Button } from "@mui/material";
import { useStore } from "@tanstack/react-form";
import { T } from "@tolgee/react";

export const CompleteRegistrationForm = WithTolgeeNs(InnerCompleteRegistrationForm, [
  "form",
  "platform.authentication.ext",
]);

export interface CompleteRegistrationFormProps {
  connector: CompleteRegistrationFormConnector;
}

function InnerCompleteRegistrationForm({ connector }: CompleteRegistrationFormProps) {
  const isSubmitSuccessful = useStore(connector.form.store, (state) => state.isSubmitSuccessful);

  if (connector.isLinkError) {
    return (
      <StatusPage color="error" icon={<MaterialSymbol icon="block" />}>
        <Typography variant="h1" color="error" textAlign="center">
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
        <Typography variant="h1" color="success" textAlign="center">
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
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      padding={SPACINGS.MEDIUM}
      gap={0}
    >
      <Section direction="column" maxWidth="100%" gap={SPACINGS.LARGE}>
        <Typography variant="h1" color="primary" alignSelf="stretch" textAlign="center">
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
    </Stack>
  );
}
