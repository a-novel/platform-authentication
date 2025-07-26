import { AppLayout } from "~/components/layout";

import type { AuthNavProps } from "@a-novel/package-authenticator";
import { BodyStyle } from "@a-novel/package-ui/mui";

import type { FC, ReactNode } from "react";

const connector: AuthNavProps["connector"] = {
  user: { loading: false, error: false },
  context: { selectedForm: undefined, selectForm: () => {} },
  sessionContext: { setSession: () => {}, synced: true },
};

export const LayoutRenderer: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={BodyStyle}>
    <AppLayout connector={connector}>{children}</AppLayout>
  </div>
);
