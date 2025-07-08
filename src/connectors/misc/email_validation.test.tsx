import { MockQueryClient, MockRequestOptions } from "#/mocks/query_client";
import { MockAnonymousSession, MockNoSession } from "#/mocks/session";
import "#/mocks/tolgee";
import { genericSetup } from "#/utils/setup";
import { SessionWrapper, StandardWrapper } from "#/utils/wrapper";

import { EmailValidation } from "~/components/misc";
import { useEmailValidationConnector } from "~/connectors/misc/email_validation";

import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import nock from "nock";
import { beforeEach, it, describe, expect } from "vitest";

let nockAPI: nock.Scope;

let queryClient: QueryClient;

const shortCode = "shortcode";

const userID = "29f71c01-5ae1-4b01-b729-e17488538e15";

describe("EmailValidationConnector", () => {
  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

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
        const nockUpdateEmail = nockAPI
          .patch("/credentials/email", { userID, shortCode }, MockRequestOptions)
          .reply(call?.status ?? 200, call?.response ?? {});

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

        if (call) {
          await waitFor(() => {
            nockUpdateEmail.done();
          });
        } else {
          expect(nockUpdateEmail.isDone()).toBe(false);
        }

        act(() => {
          screen.rerender(<EmailValidation connector={validateEmailFormConnector.result.current} />);
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
