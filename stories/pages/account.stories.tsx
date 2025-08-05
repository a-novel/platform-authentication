import { AccountPage } from "~/components/pages";

import { LayoutRenderer } from "../renderer";

import { FormRenderer, NewMockForm } from "@a-novel/package-ui/storybook";

import type { ComponentProps, FC } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

const RenderComponents: FC<{
  form: ComponentProps<typeof FormRenderer>["form"];
  currentEmail: string;
}> = ({ form, currentEmail }) => (
  <LayoutRenderer>
    <AccountPage requestEmailUpdateConnector={{ form, currentEmail }} updatePasswordConnector={{ form }} />
  </LayoutRenderer>
);

const meta: Meta<typeof AccountPage> = {
  component: AccountPage,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    requestEmailUpdateConnector: { control: { disable: true } },
    updatePasswordConnector: { control: { disable: true } },
  },
  tags: ["autodocs"],
  render: (args) => (
    <FormRenderer
      component={RenderComponents}
      currentEmail={args.requestEmailUpdateConnector.currentEmail}
      form={NewMockForm({
        values: {
          ...args.requestEmailUpdateConnector.form.state.values,
          ...args.updatePasswordConnector.form.state.values,
        },
      })}
    />
  ),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    requestEmailUpdateConnector: {
      currentEmail: "user@provider.com",
      form: NewMockForm({
        values: {
          email: "user@provider.com",
        },
      }),
    },
    updatePasswordConnector: {
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
