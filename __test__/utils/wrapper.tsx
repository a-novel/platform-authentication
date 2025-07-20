import { MockSession } from "#/mocks/session";

import { SessionContext } from "@a-novel/package-authenticator";
import { theme } from "@a-novel/package-ui/mui";

import type { ContextType, FC, ReactNode } from "react";

import { CssBaseline, ThemeProvider } from "@mui/material";

export const StandardWrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

export const SessionWrapper: FC<{ children: ReactNode; session?: ContextType<typeof SessionContext> }> = ({
  children,
  session,
}) => <SessionContext.Provider value={session ?? MockSession}>{children}</SessionContext.Provider>;
