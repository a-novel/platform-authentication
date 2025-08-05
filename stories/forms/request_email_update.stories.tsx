import { RequestEmailUpdateForm, type RequestEmailUpdateFormProps } from "~/components/forms";

import { BINDINGS_VALIDATION } from "@a-novel/connector-authentication/api";
import { SPACINGS } from "@a-novel/package-ui/mui/utils";
import { FormRenderer, NewMockForm } from "@a-novel/package-ui/storybook";

import type { ComponentProps, FC } from "react";

import { Stack } from "@mui/material";
import { type Meta, type StoryObj } from "@storybook/react-vite";

const RenderComponents: FC<
  RequestEmailUpdateFormProps & {
    form: ComponentProps<typeof FormRenderer>["form"];
  }
> = (props) => (
  <Stack height="100%" alignItems="center" justifyContent="center" padding={SPACINGS.MEDIUM}>
    <RequestEmailUpdateForm connector={{ ...props.connector, form: props.form }} />
  </Stack>
);

const meta: Meta<typeof RequestEmailUpdateForm> = {
  component: RequestEmailUpdateForm,
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
      currentEmail: "old-user@provider.com",
      form: NewMockForm({
        values: {
          email: "",
        },
      }),
    },
  },
};

export const WithValues: Story = {
  args: {
    connector: {
      currentEmail: "old-user@provider.com",
      form: NewMockForm({
        values: {
          email: "user@provider.com",
        },
      }),
    },
  },
};

export const ValuesTooLong: Story = {
  args: {
    connector: {
      currentEmail: "old-user@provider.com",
      form: NewMockForm({
        values: {
          email: String("a").repeat(BINDINGS_VALIDATION.EMAIL.MAX),
        },
      }),
    },
  },
};

export const FieldErrors: Story = {
  args: {
    connector: {
      currentEmail: "old-user@provider.com",
      form: NewMockForm({
        values: {
          email: "user@provider.com",
        },
        fieldErrors: {
          email: ["The email does not comply with our requirements."],
        },
      }),
    },
  },
};

export const Submitting: Story = {
  args: {
    connector: {
      currentEmail: "old-user@provider.com",
      form: NewMockForm({
        values: {
          email: "user@provider.com",
        },
        isSubmitting: true,
      }),
    },
  },
};

export const FieldsValidating: Story = {
  args: {
    connector: {
      currentEmail: "old-user@provider.com",
      form: NewMockForm({
        values: {
          email: "user@provider.com",
        },
        fieldsValidation: {
          email: true,
        },
      }),
    },
  },
};

export const RequestError: Story = {
  args: {
    connector: {
      currentEmail: "old-user@provider.com",
      form: NewMockForm({
        values: {
          email: "user@provider.com",
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
      currentEmail: "old-user@provider.com",
      form: NewMockForm({
        values: {
          email: "user@provider.com",
        },
        isSuccess: true,
      }),
    },
  },
};

export const UserNotLoaded: Story = {
  args: {
    connector: {
      currentEmail: "",
      form: NewMockForm({
        values: {
          email: "",
        },
      }),
    },
  },
};

export const EmailTheSame: Story = {
  args: {
    connector: {
      currentEmail: "user@provider.com",
      form: NewMockForm({
        values: {
          email: "user@provider.com",
        },
      }),
    },
  },
};
