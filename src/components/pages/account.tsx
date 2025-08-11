import { RequestEmailUpdateForm, UpdatePasswordForm } from "~/components/forms";
import type { RequestEmailUpdateFormConnector, UpdatePasswordFormConnector } from "~/connectors/forms";

import { Section } from "@a-novel/package-ui/mui/components";
import { SPACINGS } from "@a-novel/package-ui/mui/utils";
import { WithTolgeeNs } from "@a-novel/package-ui/translations";

import { Typography } from "@mui/material";
import { T } from "@tolgee/react";

export const AccountPage = WithTolgeeNs(InnerAccountPage, "platform.authentication.account");

export interface AccountPageProps {
  requestEmailUpdateConnector: RequestEmailUpdateFormConnector;
  updatePasswordConnector: UpdatePasswordFormConnector;
}

function InnerAccountPage({ requestEmailUpdateConnector, updatePasswordConnector }: AccountPageProps) {
  return (
    <Section
      margin="auto"
      boxSizing="border-box"
      component="main"
      alignSelf="center"
      width="lg"
      maxWidth="100%"
      padding={SPACINGS.LARGE}
      gap={SPACINGS.XLARGE}
    >
      <Typography color="primary" variant="h1" alignSelf="stretch">
        <T keyName="title" ns="platform.authentication.account" />
      </Typography>

      <UpdatePasswordForm connector={updatePasswordConnector} />
      <RequestEmailUpdateForm connector={requestEmailUpdateConnector} />
    </Section>
  );
}
