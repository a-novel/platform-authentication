import {
  RequestEmailUpdateForm,
  type RequestEmailUpdateFormConnector,
  UpdatePasswordForm,
  type UpdatePasswordFormConnector,
} from "~/components/forms";

import { SPACINGS } from "@a-novel/neon-ui";
import { Section } from "@a-novel/neon-ui/ui";
import { useTolgeeNamespaces } from "@a-novel/tanstack-start-config";

import { Typography } from "@mui/material";
import { T } from "@tolgee/react";

export interface AccountPageProps {
  requestEmailUpdateConnector: RequestEmailUpdateFormConnector<any, any, any, any, any, any, any, any, any>;
  updatePasswordConnector: UpdatePasswordFormConnector<any, any, any, any, any, any, any, any, any>;
}

export function AccountPage({ requestEmailUpdateConnector, updatePasswordConnector }: AccountPageProps) {
  useTolgeeNamespaces("platform.authentication.account");

  return (
    <Section
      margin="auto"
      maxWidth="100vw"
      boxSizing="border-box"
      component="main"
      alignSelf="center"
      padding={SPACINGS.LARGE}
      gap={SPACINGS.XLARGE}
    >
      <Typography color="primary" variant="h2" component="h1" alignSelf="stretch">
        <T keyName="title" ns="platform.authentication.account" />
      </Typography>

      <UpdatePasswordForm connector={updatePasswordConnector} />
      <RequestEmailUpdateForm connector={requestEmailUpdateConnector} />
    </Section>
  );
}
