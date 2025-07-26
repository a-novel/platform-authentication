import { MaterialSymbol, StatusPage } from "@a-novel/package-ui/mui/components";
import { WithTolgeeNs } from "@a-novel/package-ui/translations";

import { Typography } from "@mui/material";
import { T } from "@tolgee/react";

export const EmailValidation = WithTolgeeNs(InnerEmailValidation, "platform.authentication.ext");

export interface EmailValidationConnector {
  isSubmitSuccessful: boolean;
  isLinkError: boolean;
  isError: boolean;
}

export interface EmailValidationProps {
  connector: EmailValidationConnector;
}

function InnerEmailValidation({ connector }: EmailValidationProps) {
  if (connector.isLinkError) {
    return (
      <StatusPage color="error" icon={<MaterialSymbol icon="block" />}>
        <Typography variant="h1" color="error" textAlign="center">
          <T keyName="validateEmail.invalid.title" ns="platform.authentication.ext" />
        </Typography>
        <Typography textAlign="center">
          <T keyName="validateEmail.invalid.content" ns="platform.authentication.ext" />
        </Typography>
      </StatusPage>
    );
  }

  if (connector.isError) {
    return (
      <StatusPage color="error" icon={<MaterialSymbol icon="error" />}>
        <Typography variant="h1" color="error" textAlign="center">
          <T keyName="validateEmail.error.title" ns="platform.authentication.ext" />
        </Typography>
        <Typography textAlign="center">
          <T keyName="validateEmail.error.content" ns="platform.authentication.ext" />
        </Typography>
      </StatusPage>
    );
  }

  if (connector.isSubmitSuccessful) {
    return (
      <StatusPage color="success" icon={<MaterialSymbol icon="mark_email_read" />}>
        <Typography variant="h1" color="success" textAlign="center">
          <T keyName="validateEmail.success.title" ns="platform.authentication.ext" />
        </Typography>
        <Typography textAlign="center">
          <T keyName="validateEmail.success.content" ns="platform.authentication.ext" />
        </Typography>
        <br />
        <Typography color="textSecondary" textAlign="center">
          <T keyName="validateEmail.success.sub" ns="platform.authentication.ext" />
        </Typography>
      </StatusPage>
    );
  }

  return (
    <StatusPage color="primary">
      <Typography color="textSecondary" textAlign="center">
        <T keyName="validateEmail.submitting" ns="platform.authentication.ext" />
      </Typography>
    </StatusPage>
  );
}
