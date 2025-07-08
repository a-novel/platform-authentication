import { MockQueryClient, MockRequestOptions } from "#/mocks/query_client";
import { MockAccessToken, MockAnonymousSession } from "#/mocks/session";
import "#/mocks/tolgee";
import { writeField } from "#/utils/field";
import { genericSetup } from "#/utils/setup";
import { SessionWrapper, StandardWrapper } from "#/utils/wrapper";

import { CompletePasswordResetForm, type CompletePasswordResetFormConnector } from "~/components/forms";
import { useCompletePasswordResetFormConnector } from "~/connectors/forms";

import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";

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
import nock from "nock";
import { beforeEach, describe, expect, it } from "vitest";

let nockAPI: nock.Scope;

let completePasswordResetFormConnector: RenderHookResult<
  CompletePasswordResetFormConnector<any, any, any, any, any, any, any, any, any>,
  object
>;
let screen: RenderResult;

let queryClient: QueryClient;

const shortCode = "shortcode";

const userID = "29f71c01-5ae1-4b01-b729-e17488538e15";

describe("CompletePasswordResetForm", () => {
  genericSetup({
    setNockAPI: (newScope) => {
      nockAPI = newScope;
    },
  });

  beforeEach(() => {
    queryClient = new QueryClient(MockQueryClient);

    // Render the hook, then inject the connector into the form.
    completePasswordResetFormConnector = renderHook((props) => useCompletePasswordResetFormConnector(props), {
      initialProps: { userID, shortCode },
      wrapper: ({ children }: { children: ReactNode }) => (
        <SessionWrapper session={MockAnonymousSession}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </SessionWrapper>
      ),
    });

    screen = render(<CompletePasswordResetForm connector={completePasswordResetFormConnector.result.current} />, {
      wrapper: StandardWrapper,
    });
  });

  describe("renders", async () => {
    // Verify inputs are rendered.
    const inputs = [
      /platform\.authentication\.ext:resetPassword\.fields\.newPassword\.label/,
      /platform\.authentication\.ext:resetPassword\.fields\.newPasswordConfirmation\.label/,
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
        tKey: /platform\.authentication\.ext:resetPassword\.fields\.newPassword\.label/,
        max: BINDINGS_VALIDATION.PASSWORD.MAX,
        min: BINDINGS_VALIDATION.PASSWORD.MIN,
        required: true,
      },
      {
        name: "passwordConfirmation",
        tKey: /platform\.authentication\.ext:resetPassword\.fields\.newPasswordConfirmation\.label/,
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
            tKey: /platform\.authentication\.ext:resetPassword\.fields\.newPassword\.label/,
            value: "new-password",
          },
          passwordConfirmation: {
            tKey: /platform\.authentication\.ext:resetPassword\.fields\.newPasswordConfirmation\.label/,
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
      const passwordInput = screen.getByLabelText(
        /platform\.authentication\.ext:resetPassword\.fields\.newPassword\.label/
      ) as HTMLInputElement;
      const passwordConfirmationInput = screen.getByLabelText(
        /platform\.authentication\.ext:resetPassword\.fields\.newPasswordConfirmation\.label/
      ) as HTMLInputElement;

      await writeField(passwordInput, "123456");
      await writeField(passwordConfirmationInput, "1234567");

      await waitFor(() => {
        expect(
          screen.getByText(
            /platform\.authentication\.ext:resetPassword\.fields\.newPasswordConfirmation\.errors\.mismatch/
          )
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
        responseStatus: 204,
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
        expectErrors: [/platform\.authentication\.ext:resetPassword\.form\.errors\.generic/],
      },
    };

    for (const [name, { form, responseStatus, expectErrors }] of Object.entries(forms)) {
      it(name, async () => {
        const nockUpdatePassword = nockAPI
          .patch("/credentials/password/reset", { password: form.password, userID, shortCode }, MockRequestOptions)
          .reply(responseStatus, { accessToken: "new-" + MockAccessToken });

        const passwordInput = screen.getByLabelText(
          /platform\.authentication\.ext:resetPassword\.fields\.newPassword\.label/
        ) as HTMLInputElement;
        const passwordConfirmationInput = screen.getByLabelText(
          /platform\.authentication\.ext:resetPassword\.fields\.newPasswordConfirmation\.label/
        ) as HTMLInputElement;

        const submitButton = screen.getByText(/platform\.authentication\.ext:resetPassword\.form\.submit/, {
          selector: "button",
        });

        await writeField(passwordInput, form.password);
        await writeField(passwordConfirmationInput, form.passwordConfirmation);

        // Submit the form.
        act(() => {
          fireEvent.click(submitButton);
        });

        // Wait for the form to submit.
        await waitFor(() => {
          nockUpdatePassword.done();
        });

        // Check the form errors.
        await waitFor(() => {
          for (const error of expectErrors) {
            expect(screen.queryByText(error)).toBeDefined();
          }
        });

        if (expectErrors.length === 0) {
          await waitFor(() => {
            expect(screen.getByText(/platform\.authentication\.ext:resetPassword\.form\.success\.title/)).toBeDefined();
            expect(screen.getByText(/platform\.authentication\.ext:resetPassword\.form\.success\.main/)).toBeDefined();
          });
        } else {
          await waitFor(() => {
            expect(screen.queryByText(/platform\.authentication\.ext:resetPassword\.form\.success\.title/)).toBeNull();
            expect(screen.queryByText(/platform\.authentication\.ext:resetPassword\.form\.success\.main/)).toBeNull();
          });
        }
      });
    }
  });
});
