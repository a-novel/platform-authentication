import { CompleteRegistrationForm, type CompleteRegistrationFormProps } from "~/components/forms";

import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { FormRenderer, NewMockForm } from "@a-novel/package-ui/storybook";

import type { FC } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";
import { type ReactFormExtendedApi } from "@tanstack/react-form";

const RenderComponents: FC<
  CompleteRegistrationFormProps & {
    form: ReactFormExtendedApi<any, any, any, any, any, any, any, any, any, any>;
  }
> = (props) => <CompleteRegistrationForm connector={{ ...props.connector, form: props.form }} />;

const meta: Meta<typeof CompleteRegistrationForm> = {
  component: CompleteRegistrationForm,
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
      isLinkError: false,
      toDashboard: () => {},
      form: NewMockForm({
        values: {
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
      isLinkError: false,
      toDashboard: () => {},
      form: NewMockForm({
        values: {
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
      isLinkError: false,
      toDashboard: () => {},
      form: NewMockForm({
        values: {
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
      isLinkError: false,
      toDashboard: () => {},
      form: NewMockForm({
        values: {
          password: "abcdef",
          passwordConfirmation: "abcdef",
        },
        fieldErrors: {
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
      isLinkError: false,
      toDashboard: () => {},
      form: NewMockForm({
        values: {
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
      isLinkError: false,
      toDashboard: () => {},
      form: NewMockForm({
        values: {
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
      isLinkError: false,
      toDashboard: () => {},
      form: NewMockForm({
        values: {
          password: "abcdef",
          passwordConfirmation: "abcdef",
        },
        isSuccess: true,
      }),
    },
  },
};

export const LinkError: Story = {
  args: {
    connector: {
      isLinkError: true,
      toDashboard: () => {},
      form: NewMockForm({
        values: {
          password: "abcdef",
          passwordConfirmation: "abcdef",
        },
      }),
    },
  },
};
