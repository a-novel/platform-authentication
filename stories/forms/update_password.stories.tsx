import { UpdatePasswordForm, type UpdatePasswordFormProps } from "~/components/forms";

import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { SPACINGS } from "@a-novel/package-ui/mui/utils";
import { FormRenderer, NewMockForm } from "@a-novel/package-ui/storybook";

import type { FC } from "react";

import { Stack } from "@mui/material";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import { type ReactFormExtendedApi } from "@tanstack/react-form";

const RenderComponents: FC<
  UpdatePasswordFormProps & {
    form: ReactFormExtendedApi<any, any, any, any, any, any, any, any, any, any>;
  }
> = (props) => (
  <Stack height="100%" alignItems="center" justifyContent="center" padding={SPACINGS.MEDIUM}>
    <UpdatePasswordForm connector={{ ...props.connector, form: props.form }} />
  </Stack>
);

const meta: Meta<typeof UpdatePasswordForm> = {
  component: UpdatePasswordForm,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    connector: { control: { disable: true } },
  },
  tags: ["autodocs"],
  render: (args) => <FormRenderer component={RenderComponents} form={args.connector.form} {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    connector: {
      form: NewMockForm({
        values: {
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
        },
      }),
    },
  },
};

export const WithValues: Story = {
  args: {
    connector: {
      form: NewMockForm({
        values: {
          currentPassword: "123456",
          password: "abcdef",
          passwordConfirmation: "abcdef",
        },
      }),
    },
  },
};

export const ValuesTooLong: Story = {
  args: {
    connector: {
      form: NewMockForm({
        values: {
          currentPassword: String("a").repeat(BINDINGS_VALIDATION.PASSWORD.MAX),
          password: String("a").repeat(BINDINGS_VALIDATION.PASSWORD.MAX),
          passwordConfirmation: String("a").repeat(BINDINGS_VALIDATION.PASSWORD.MAX),
        },
      }),
    },
  },
};

export const FieldErrors: Story = {
  args: {
    connector: {
      form: NewMockForm({
        values: {
          currentPassword: "123456",
          password: "abcdef",
          passwordConfirmation: "abcdef",
        },
        fieldErrors: {
          currentPassword: ["The password is incorrect."],
          password: ["The password does not comply with our requirements."],
          passwordConfirmation: ["The password confirmation does not match."],
        },
      }),
    },
  },
};

export const Submitting: Story = {
  args: {
    connector: {
      form: NewMockForm({
        values: {
          currentPassword: "123456",
          password: "abcdef",
          passwordConfirmation: "abcdef",
        },
        isSubmitting: true,
      }),
    },
  },
};

export const RequestError: Story = {
  args: {
    connector: {
      form: NewMockForm({
        values: {
          currentPassword: "123456",
          password: "abcdef",
          passwordConfirmation: "abcdef",
        },
        formErrors: {
          onSubmit: "An unexpected error occurred, please retry later.",
        },
      }),
    },
  },
};

export const Success: Story = {
  args: {
    connector: {
      form: NewMockForm({
        values: {
          currentPassword: "123456",
          password: "abcdef",
          passwordConfirmation: "abcdef",
        },
        isSuccess: true,
      }),
    },
  },
};
