import type { EmailValidationConnector } from "~/components/forms/static";

import { isForbiddenError } from "@a-novel/connector-authentication/api";
import { UpdateEmail } from "@a-novel/connector-authentication/hooks";
import { useAccessToken } from "@a-novel/package-authenticator";

import { useEffect } from "react";

export interface EmailValidationConnectorProps {
  userID: string;
  shortCode: string;
}

export function useEmailValidationConnector({
  userID,
  shortCode,
}: EmailValidationConnectorProps): EmailValidationConnector {
  const accessToken = useAccessToken();

  const emailUpdate = UpdateEmail.useAPI(accessToken);

  const { mutateAsync: updateEmail } = emailUpdate;

  useEffect(() => {
    if (accessToken) {
      updateEmail({
        userID,
        shortCode,
      }).catch(console.error);
    }
  }, [accessToken, updateEmail, shortCode, userID]);

  const isForbidden = isForbiddenError(emailUpdate.error);

  return {
    isSubmitSuccessful: emailUpdate.isSuccess,
    isError: emailUpdate.isError && !isForbidden,
    isLinkError: isForbidden,
  };
}
