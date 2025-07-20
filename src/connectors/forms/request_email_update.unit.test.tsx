import { MockHeaders } from "#/mocks/query_client";
import { MockAccessToken, MockCurrentUser, MockSession } from "#/mocks/session";
import "#/mocks/tolgee";
import { server } from "#/setup/unit";
import { SessionWrapper, StandardWrapper } from "#/utils/wrapper";

import { RequestEmailUpdateForm } from "~/components/forms";
import {
  useRequestEmailUpdateFormConnector,
  type RequestEmailUpdateFormConnector,
} from "~/connectors/forms/request_email_update";

import { BINDINGS_VALIDATION, LangEnum } from "@a-novel/connector-authentication/api";
import { GetUser } from "@a-novel/connector-authentication/hooks";
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
import { beforeEach, describe, expect, it } from "vitest";

let requestEmailUpdateFormConnector: RenderHookResult<RequestEmailUpdateFormConnector, object>;
let screen: RenderResult;

let queryClient: QueryClient;

describe("RequestEmailUpdate", () => {
  beforeEach(async () => {
    queryClient = new QueryClient(MockQueryClient);

    server.use(
      http
        .get("http://localhost:4011/user")
        .headers(new Headers(MockHeaders), HttpResponse.error())
        .searchParams(new URLSearchParams({ userID: MockSession.session!.claims!.userID! }), true, HttpResponse.error())
        .resolve(() => HttpResponse.json(MockCurrentUser))
    );

    // Render the hook, then inject the connector into the form.
    requestEmailUpdateFormConnector = renderHook(() => useRequestEmailUpdateFormConnector(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <SessionWrapper session={MockSession}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </SessionWrapper>
      ),
    });

    await waitFor(() => {
      expect(requestEmailUpdateFormConnector.result.current).not.toBeNull();
    });
    requestEmailUpdateFormConnector.rerender();

    screen = render(<RequestEmailUpdateForm connector={requestEmailUpdateFormConnector.result.current} />, {
      wrapper: StandardWrapper,
    });
  });

  describe("renders", async () => {
    // Verify inputs are rendered.
    const inputs = [/form:fields\.email\.label/];

    for (const label of inputs) {
      it(`renders input with label ${label}`, async () => {
        const input = screen.getByLabelText(label) as HTMLInputElement;
        await waitFor(() => {
          expect(input).toBeDefined();
          expect((input as HTMLInputElement).disabled).toBe(false);
        });
      });
    }

    it("reacts to user update", async () => {
      const emailInput = screen.getByLabelText(/form:fields\.email\.label/) as HTMLInputElement;
      expect(emailInput.value).toBe(MockCurrentUser.email);

      // Update cached value in react-query.
      queryClient.setQueryData(GetUser.key(MockAccessToken, { userID: MockCurrentUser.id }), {
        ...MockCurrentUser,
        email: "new-" + MockCurrentUser.email,
      });

      requestEmailUpdateFormConnector.rerender();

      await waitFor(() => {
        expect(emailInput.value).toBe("new-" + MockCurrentUser.email);
      });
    });
  });

  describe("form state", () => {
    const fields = [
      {
        name: "email",
        tKey: /form:fields\.email\.label/,
        max: BINDINGS_VALIDATION.EMAIL.MAX,
        min: BINDINGS_VALIDATION.EMAIL.MIN,
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
          email: { tKey: /form:fields\.email\.label/, value: "user@provider.com" },
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

    it("handles email validation", async () => {
      const emailInput = screen.getByLabelText(/form:fields\.email\.label/) as HTMLInputElement;
      expect(emailInput).toBeDefined();

      // Write an invalid email.
      await writeField(emailInput, "invalid-email");
      // Check for the invalid email error.
      await waitFor(() => {
        expect(screen.queryByText(/form:fields\.email\.errors\.invalid/)).toBeDefined();
      });

      // Write a valid email.
      await writeField(emailInput, "user@provider.com");
      // Check that the invalid email error is gone.
      await waitFor(() => {
        expect(screen.queryByText(/form:fields\.email\.errors\.invalid/)).toBeNull();
      });
    });

    it("prevents update when email has not changed", async () => {
      const emailInput = screen.getByLabelText(/form:fields\.email\.label/) as HTMLInputElement;
      expect(emailInput).toBeDefined();

      const submitButton = screen.getByText(/platform\.authentication\.account:requestEmailUpdate\.form\.submit/, {
        selector: "button",
      }) as HTMLButtonElement;
      expect(submitButton).toBeDefined();

      // Submit button should be disabled initially.
      expect(submitButton.disabled).toBe(true);

      // Write a new email.
      await writeField(emailInput, "new-user@provider.com");

      // Submit button should be enabled now.
      expect(submitButton.disabled).toBe(false);

      // Write the same email again.
      await writeField(emailInput, MockCurrentUser.email);
      // Submit button should be disabled again.
      expect(submitButton.disabled).toBe(true);
    });
  });

  describe("sending form", () => {
    const forms = {
      "successfully submits": {
        form: {
          email: "new-" + MockCurrentUser.email,
          lang: LangEnum.En,
        },
        responseStatus: 204,
        expectErrors: [],
      },
      "sets global error on unknown error": {
        form: {
          email: "new-" + MockCurrentUser.email,
          lang: LangEnum.En,
        },
        responseStatus: 500,
        expectErrors: [/platform\.authentication\.account:requestEmailUpdate\.form\.errors\.generic/],
      },
    };

    for (const [name, { form, responseStatus, expectErrors }] of Object.entries(forms)) {
      it(name, async () => {
        server.use(
          http
            .put("http://localhost:4011/short-code/update-email")
            .headers(new Headers(MockHeaders), HttpResponse.error())
            .bodyJSON(form, HttpResponse.error())
            .resolve(() => HttpResponse.json(undefined, { status: responseStatus }))
        );

        const emailInput = screen.getByLabelText(/form:fields\.email\.label/) as HTMLInputElement;

        const submitButton = screen.getByText(/platform\.authentication\.account:requestEmailUpdate\.form\.submit/, {
          selector: "button",
        });

        await writeField(emailInput, form.email);

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
            expect(
              screen.getByText(/platform\.authentication\.account:requestEmailUpdate\.form\.success\.title/)
            ).toBeDefined();
            expect(
              screen.getByText(/platform\.authentication\.account:requestEmailUpdate\.form\.success\.main/)
            ).toBeDefined();
            expect(
              screen.getByText(/platform\.authentication\.account:requestEmailUpdate\.form\.success\.sub/)
            ).toBeDefined();
          });
        } else {
          await waitFor(() => {
            expect(
              screen.queryByText(/platform\.authentication\.account:requestEmailUpdate\.form\.success\.title/)
            ).toBeNull();
            expect(
              screen.queryByText(/platform\.authentication\.account:requestEmailUpdate\.form\.success\.main/)
            ).toBeNull();
            expect(
              screen.queryByText(/platform\.authentication\.account:requestEmailUpdate\.form\.success\.sub/)
            ).toBeNull();
          });
        }
      });
    }
  });
});
