import { MockHeaders } from "#/mocks/query_client";
import { MockAccessToken, MockAnonymousSession } from "#/mocks/session";
import "#/mocks/tolgee";
import { server } from "#/setup/unit";
import { SessionWrapper, StandardWrapper } from "#/utils/wrapper";

import { CompleteRegistrationForm } from "~/components/forms";
import {
  useCompleteRegistrationFormConnector,
  type CompleteRegistrationFormConnector,
} from "~/connectors/forms/complete_registration";

import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { MockQueryClient } from "@a-novel/nodelib/mocks/query_client";
import { http } from "@a-novel/nodelib/msw";
import { writeField } from "@a-novel/nodelib/test/form";

import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  renderHook,
  type RenderHookResult,
  type RenderResult,
  waitFor,
} from "@testing-library/react";
import { HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

let completeRegisterFormConnector: RenderHookResult<CompleteRegistrationFormConnector, object>;
let screen: RenderResult;

let queryClient: QueryClient;

const toDashboardAction = vi.fn();

const shortCode = "shortcode";

const email = "new-user@provider.com";

describe("CompleteRegistrationForm", () => {
  beforeEach(() => {
    queryClient = new QueryClient(MockQueryClient);

    // Render the hook, then inject the connector into the form.
    completeRegisterFormConnector = renderHook((props) => useCompleteRegistrationFormConnector(props), {
      initialProps: { toDashboard: toDashboardAction, email, shortCode },
      wrapper: ({ children }: { children: ReactNode }) => (
        <SessionWrapper session={MockAnonymousSession}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </SessionWrapper>
      ),
    });

    screen = render(<CompleteRegistrationForm connector={completeRegisterFormConnector.result.current} />, {
      wrapper: StandardWrapper,
    });
  });

  describe("renders", async () => {
    // Verify inputs are rendered.
    const inputs = [
      /form:fields\.password\.label/,
      /platform\.authentication\.ext:register\.fields\.passwordConfirmation\.label/,
    ];

    for (const label of inputs) {
      it(`renders input with label ${label}`, () => {
        const input = screen.getByLabelText(label) as HTMLInputElement;
        expect(input).toBeDefined();
        expect((input as HTMLInputElement).disabled).toBe(false);
      });
    }
  });

  describe("form state", () => {
    const fields = [
      {
        name: "password",
        tKey: /form:fields\.password\.label/,
        max: BINDINGS_VALIDATION.PASSWORD.MAX,
        min: BINDINGS_VALIDATION.PASSWORD.MIN,
        required: true,
      },
      {
        name: "passwordConfirmation",
        tKey: /platform\.authentication\.ext:register\.fields\.passwordConfirmation\.label/,
        max: BINDINGS_VALIDATION.PASSWORD.MAX,
        min: BINDINGS_VALIDATION.PASSWORD.MIN,
        required: true,
      },
    ];

    for (const field of fields) {
      describe(`field: ${field.name}`, () => {
        it("renders no error initially", () => {
          expect(screen.queryAllByText(/text.errors.tooLong/)).length(0);
          expect(screen.queryAllByText(/text.errors.tooShort/)).length(0);
          expect(screen.queryAllByText(/text.errors.required/)).length(0);
        });

        const initialForm = {
          password: {
            tKey: /form:fields\.password\.label/,
            value: "new-password",
          },
          passwordConfirmation: {
            tKey: /platform\.authentication\.ext:register\.fields\.passwordConfirmation\.label/,
            value: "new-password",
          },
        };

        const cases = {
          standard: {
            value: "a".repeat(field.max - 1),
            expectValue: undefined,
            errors: {
              tooLong: 0,
              tooShort: 0,
              required: 0,
            },
          },
          tooLong: {
            value: "a".repeat(field.max * 2),
            expectValue: "a".repeat(field.max),
            errors: {
              tooLong: 1,
              tooShort: 0,
              required: 0,
            },
          },
          empty: {
            value: "",
            expectValue: undefined,
            errors: {
              tooLong: 0,
              tooShort: field.min > 0 ? 1 : 0,
              required: field.required ? 1 : 0,
            },
          },
          tooShort: {
            value: "a".repeat(field.min - 1),
            expectValue: undefined,
            errors: {
              tooLong: 0,
              tooShort: field.min > 1 ? 1 : 0,
              required: 0,
            },
          },
        };

        for (const [caseName, testCase] of Object.entries(cases)) {
          it(`handles ${caseName} case`, async () => {
            // Because writing a field will trigger validation for all of them, we MUST make sure they are
            // all filled before writing our target field.
            for (const [_, fieldData] of Object.entries(initialForm)) {
              const fieldInput = screen.getByLabelText(fieldData.tKey) as HTMLInputElement;
              expect(fieldInput).toBeDefined();
              await writeField(fieldInput, fieldData.value);
            }

            await waitFor(() => {
              expect(screen.queryAllByText(/text.errors.tooLong/)).length(0);
              expect(screen.queryAllByText(/text.errors.tooShort/)).length(0);
              expect(screen.queryAllByText(/text.errors.required/)).length(0);
            });

            const fieldInput = screen.getByLabelText(field.tKey) as HTMLInputElement;
            expect(fieldInput).toBeDefined();

            // Write the field with the test case value.
            await writeField(fieldInput, testCase.value, testCase.expectValue as string | undefined);

            // Check the errors.
            await waitFor(() => {
              expect(screen.queryAllByText(/text.errors.tooLong/)).length(testCase.errors.tooLong);
              expect(screen.queryAllByText(/text.errors.tooShort/)).length(testCase.errors.tooShort);
              expect(screen.queryAllByText(/text.errors.required/)).length(testCase.errors.required);
            });
          });
        }
      });
    }

    it("handles password confirmation validation", async () => {
      const passwordInput = screen.getByLabelText(/form:fields\.password\.label/) as HTMLInputElement;
      const passwordConfirmationInput = screen.getByLabelText(
        /platform\.authentication\.ext:register\.fields\.passwordConfirmation\.label/
      ) as HTMLInputElement;

      await writeField(passwordInput, "123456");
      await writeField(passwordConfirmationInput, "1234567");

      await waitFor(() => {
        expect(
          screen.getByText(/platform\.authentication\.ext:register\.fields\.passwordConfirmation\.errors\.mismatch/)
        ).toBeDefined();
      });
    });
  });

  describe("sending form", () => {
    const forms = {
      "successfully submits": {
        form: {
          password: "new-password",
          passwordConfirmation: "new-password",
        },
        responseStatus: 200,
        expectLinkError: false,
        expectErrors: [],
      },
      "sets link error when short code is rejected": {
        form: {
          password: "new-password",
          passwordConfirmation: "new-password",
        },
        responseStatus: 403,
        expectLinkError: true,
        expectErrors: [],
      },
      "sets global error on unknown error": {
        form: {
          password: "new-password",
          passwordConfirmation: "new-password",
        },
        responseStatus: 500,
        expectLinkError: false,
        expectErrors: [/platform\.authentication\.ext:register\.form\.errors\.generic/],
      },
    };

    for (const [name, { form, responseStatus, expectErrors }] of Object.entries(forms)) {
      it(name, async () => {
        server.use(
          http
            .put("http://localhost:4011/credentials")
            .headers(new Headers(MockHeaders), HttpResponse.error())
            .bodyJSON({ password: form.password, email, shortCode }, HttpResponse.error())
            .resolve(() => HttpResponse.json({ accessToken: "new-" + MockAccessToken }, { status: responseStatus }))
        );

        const passwordInput = screen.getByLabelText(/form:fields\.password\.label/) as HTMLInputElement;
        const passwordConfirmationInput = screen.getByLabelText(
          /platform\.authentication\.ext:register\.fields\.passwordConfirmation\.label/
        ) as HTMLInputElement;

        const submitButton = screen.getByText(/platform\.authentication\.ext:register\.form\.submit/, {
          selector: "button",
        });

        await writeField(passwordInput, form.password);
        await writeField(passwordConfirmationInput, form.passwordConfirmation);

        // Submit the form.
        act(() => {
          fireEvent.click(submitButton);
        });

        // Check the form errors.
        await waitFor(() => {
          for (const error of expectErrors) {
            expect(screen.queryByText(error)).toBeDefined();
          }
        });

        if (expectErrors.length === 0) {
          await waitFor(() => {
            expect(screen.getByText(/platform\.authentication\.ext:register\.form\.success\.title/)).toBeDefined();
            expect(screen.getByText(/platform\.authentication\.ext:register\.form\.success\.main/)).toBeDefined();
          });

          // Get form action and make sure it triggered the dashboard action.
          const formAction = screen.getByText(/platform\.authentication\.ext:register\.form\.success\.action/, {
            selector: "button",
          });
          expect(formAction).toBeDefined();

          act(() => {
            fireEvent.click(formAction);
          });

          expect(toDashboardAction).toHaveBeenCalledTimes(1);
        } else {
          await waitFor(() => {
            expect(screen.queryByText(/platform\.authentication\.ext:register\.form\.success\.title/)).toBeNull();
            expect(screen.queryByText(/platform\.authentication\.ext:register\.form\.success\.main/)).toBeNull();
          });
        }
      });
    }
  });
});
