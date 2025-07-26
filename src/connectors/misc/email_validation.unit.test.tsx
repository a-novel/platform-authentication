import { MockHeaders } from "#/mocks/query_client";
import { MockAnonymousSession, MockNoSession } from "#/mocks/session";
import "#/mocks/tolgee";
import { server } from "#/setup/unit";
import { SessionWrapper, StandardWrapper } from "#/utils/wrapper";

import { EmailValidation } from "~/components/misc";
import { useEmailValidationConnector } from "~/connectors/misc/email_validation";

import { MockQueryClient } from "@a-novel/nodelib/mocks/query_client";
import { http } from "@a-novel/nodelib/msw";

import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse } from "msw";
import { beforeEach, it, describe, expect } from "vitest";

let queryClient: QueryClient;

const shortCode = "shortcode";

const userID = "94b4d288-dbff-4eca-805a-f45311a34e15";

describe("EmailValidationConnector", () => {
  beforeEach(() => {
    queryClient = new QueryClient(MockQueryClient);
  });

  describe("page state", () => {
    const testCases = {
      "renders loading state while no response is received": {
        session: MockNoSession,
        call: undefined,
        expect: {
          loading: true,
          success: false,
          error: false,
          linkError: false,
        },
      },
      "renders success state when email is validated": {
        session: MockAnonymousSession,
        call: {
          status: 200,
          response: { email: "new-email@provider.com" },
        },
        expect: {
          loading: false,
          success: true,
          error: false,
          linkError: false,
        },
      },
      "renders link error when invalid": {
        session: MockAnonymousSession,
        call: {
          status: 403,
          response: null,
        },
        expect: {
          loading: false,
          success: false,
          error: false,
          linkError: true,
        },
      },
      "renders error": {
        session: MockAnonymousSession,
        call: {
          status: 500,
          response: null,
        },
        expect: {
          loading: false,
          success: false,
          error: true,
          linkError: false,
        },
      },
    };

    for (const [name, { session, call, expect: expected }] of Object.entries(testCases)) {
      it(name, async () => {
        server.use(
          http
            .patch("http://localhost:4011/credentials/email")
            .headers(new Headers(MockHeaders), HttpResponse.error())
            .bodyJSON({ userID, shortCode }, HttpResponse.error())
            .resolve(() => {
              if (!call) return;
              return HttpResponse.json(call?.response, { status: call?.status ?? 200 });
            })
        );

        const validateEmailFormConnector = renderHook((props) => useEmailValidationConnector(props), {
          initialProps: { userID, shortCode },
          wrapper: ({ children }: { children: ReactNode }) => (
            <SessionWrapper session={session}>
              <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </SessionWrapper>
          ),
        });

        const screen = render(<EmailValidation connector={validateEmailFormConnector.result.current} />, {
          wrapper: StandardWrapper,
        });

        const groups = [
          {
            content: [/platform\.authentication\.ext:validateEmail\.submitting/],
            show: expected.loading,
          },
          {
            content: [
              /platform\.authentication\.ext:validateEmail\.success\.title/,
              /platform\.authentication\.ext:validateEmail\.success\.content/,
              /platform\.authentication\.ext:validateEmail\.success\.sub/,
            ],
            show: expected.success,
          },
          {
            content: [
              /platform\.authentication\.ext:validateEmail\.invalid\.title/,
              /platform\.authentication\.ext:validateEmail\.invalid\.content/,
            ],
            show: expected.linkError,
          },
          {
            content: [
              /platform\.authentication\.ext:validateEmail\.error\.title/,
              /platform\.authentication\.ext:validateEmail\.error\.content/,
            ],
            show: expected.error,
          },
        ];

        await waitFor(() => {
          screen.rerender(<EmailValidation connector={validateEmailFormConnector.result.current} />);
          groups.forEach((group) =>
            group.content.forEach((item) => {
              const expectation = expect(screen.queryByText(item), `${item}`);
              if (group.show) expectation.toBeDefined();
              else expectation.toBeNull();
            })
          );
        });
      });
    }
  });
});
