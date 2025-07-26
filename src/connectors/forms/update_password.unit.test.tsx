import { MockHeaders } from "#/mocks/query_client";
import "#/mocks/tolgee";
import { server } from "#/setup/unit";
import { SessionWrapper, StandardWrapper } from "#/utils/wrapper";

import { UpdatePasswordForm } from "~/components/forms";
import { useUpdatePasswordFormConnector, type UpdatePasswordFormConnector } from "~/connectors/forms/update_password";

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
import { describe, it, expect, beforeEach } from "vitest";

let updatePasswordFormConnector: RenderHookResult<UpdatePasswordFormConnector, object>;
let screen: RenderResult;

let queryClient: QueryClient;

describe("UpdatePassword", () => {
  beforeEach(() => {
    queryClient = new QueryClient(MockQueryClient);

    // Render the hook, then inject the connector into the form.
    updatePasswordFormConnector = renderHook(() => useUpdatePasswordFormConnector(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <SessionWrapper>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </SessionWrapper>
      ),
    });

    screen = render(<UpdatePasswordForm connector={updatePasswordFormConnector.result.current} />, {
      wrapper: StandardWrapper,
    });
  });

  describe("renders", async () => {
    // Verify inputs are rendered.
    const inputs = [
      /platform\.authentication\.account:updatePassword\.fields\.currentPassword\.label/,
      /platform\.authentication\.account:updatePassword\.fields\.newPassword\.label/,
      /platform\.authentication\.account:updatePassword\.fields\.newPasswordConfirmation\.label/,
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
        name: "currentPassword",
        tKey: /platform\.authentication\.account:updatePassword\.fields\.currentPassword\.label/,
        max: BINDINGS_VALIDATION.PASSWORD.MAX,
        min: BINDINGS_VALIDATION.PASSWORD.MIN,
        required: true,
      },
      {
        name: "password",
        tKey: /platform\.authentication\.account:updatePassword\.fields\.newPassword\.label/,
        max: BINDINGS_VALIDATION.PASSWORD.MAX,
        min: BINDINGS_VALIDATION.PASSWORD.MIN,
        required: true,
      },
      {
        name: "passwordConfirmation",
        tKey: /platform\.authentication\.account:updatePassword\.fields\.newPasswordConfirmation\.label/,
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
          currentPassword: {
            tKey: /platform\.authentication\.account:updatePassword\.fields\.currentPassword\.label/,
            value: "current-password",
          },
          password: {
            tKey: /platform\.authentication\.account:updatePassword\.fields\.newPassword\.label/,
            value: "new-password",
          },
          passwordConfirmation: {
            tKey: /platform\.authentication\.account:updatePassword\.fields\.newPasswordConfirmation\.label/,
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
      const currentPasswordInput = screen.getByLabelText(
        /platform\.authentication\.account:updatePassword\.fields\.currentPassword\.label/
      ) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        /platform\.authentication\.account:updatePassword\.fields\.newPassword\.label/
      ) as HTMLInputElement;
      const passwordConfirmationInput = screen.getByLabelText(
        /platform\.authentication\.account:updatePassword\.fields\.newPasswordConfirmation\.label/
      ) as HTMLInputElement;

      await writeField(currentPasswordInput, "abcdef");
      await writeField(passwordInput, "123456");
      await writeField(passwordConfirmationInput, "1234567");

      await waitFor(() => {
        expect(
          screen.getByText(
            /platform\.authentication\.account:updatePassword\.fields\.newPasswordConfirmation\.errors\.mismatch/
          )
        ).toBeDefined();
      });
    });
  });

  describe("sending form", () => {
    const forms = {
      "successfully submits": {
        form: {
          currentPassword: "current-password",
          password: "new-password",
          passwordConfirmation: "new-password",
        },
        responseStatus: 204,
        expectErrors: [],
      },
      "successfully submits with fields at size limit": {
        form: {
          currentPassword: "c".repeat(BINDINGS_VALIDATION.PASSWORD.MAX),
          password: "n".repeat(BINDINGS_VALIDATION.PASSWORD.MAX),
          passwordConfirmation: "n".repeat(BINDINGS_VALIDATION.PASSWORD.MAX),
        },
        responseStatus: 204,
        expectErrors: [],
      },
      "sets password incorrect on forbidden error": {
        form: {
          currentPassword: "current-password",
          password: "new-password",
          passwordConfirmation: "new-password",
        },
        responseStatus: 403,
        expectErrors: [/form:fields\.password\.errors\.invalid/],
      },
      "sets global error on unknown error": {
        form: {
          currentPassword: "current-password",
          password: "new-password",
          passwordConfirmation: "new-password",
        },
        responseStatus: 500,
        expectErrors: [/platform\.authentication\.account:updatePassword\.form\.errors\.generic/],
      },
    };

    for (const [name, { form, responseStatus, expectErrors }] of Object.entries(forms)) {
      it(name, async () => {
        server.use(
          http
            .patch("http://localhost:4011/credentials/password")
            .headers(new Headers(MockHeaders), HttpResponse.error())
            .bodyJSON(form, HttpResponse.error())
            .resolve(() => HttpResponse.json(undefined, { status: responseStatus }))
        );

        const currentPasswordInput = screen.getByLabelText(
          /platform\.authentication\.account:updatePassword\.fields\.currentPassword\.label/
        ) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(
          /platform\.authentication\.account:updatePassword\.fields\.newPassword\.label/
        ) as HTMLInputElement;
        const passwordConfirmationInput = screen.getByLabelText(
          /platform\.authentication\.account:updatePassword\.fields\.newPasswordConfirmation\.label/
        ) as HTMLInputElement;

        const submitButton = screen.getByText(/platform\.authentication\.account:updatePassword\.form\.submit/, {
          selector: "button",
        });

        await writeField(currentPasswordInput, form.currentPassword);
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
            expect(
              screen.getByText(/platform\.authentication\.account:updatePassword\.form\.success\.title/)
            ).toBeDefined();
            expect(
              screen.getByText(/platform\.authentication\.account:updatePassword\.form\.success\.main/)
            ).toBeDefined();
          });
        } else {
          await waitFor(() => {
            expect(
              screen.queryByText(/platform\.authentication\.account:updatePassword\.form\.success\.title/)
            ).toBeNull();
            expect(
              screen.queryByText(/platform\.authentication\.account:updatePassword\.form\.success\.main/)
            ).toBeNull();
          });
        }
      });
    }
  });
});
