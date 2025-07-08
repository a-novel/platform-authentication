import banner from "~/assets/images/banner.png";

import { AgoraDefaultLayout, BodyStyle } from "@a-novel/tanstack-start-config";

import type { ComponentProps, FC, ReactNode } from "react";

const connector: ComponentProps<typeof AgoraDefaultLayout>["authConnector"] = {
  user: { loading: false, error: false },
  context: { selectedForm: undefined, selectForm: () => {} },
  sessionContext: { setSession: () => {}, synced: true },
};

export const LayoutRenderer: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={BodyStyle}>
    <AgoraDefaultLayout
      authConnector={connector}
      banner={banner}
      links={{
        account: { component: "div" },
      }}
    >
      {children}
    </AgoraDefaultLayout>
  </div>
);
