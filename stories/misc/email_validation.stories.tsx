import { EmailValidation } from "~/components/misc";

import { LayoutRenderer } from "../renderer";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof EmailValidation> = {
  component: EmailValidation,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    connector: { control: { disable: true } },
  },
  tags: ["autodocs"],
  render: (args) => (
    <LayoutRenderer>
      <EmailValidation {...args} />
    </LayoutRenderer>
  ),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    connector: {
      isSubmitSuccessful: false,
      isLinkError: false,
      isError: false,
    },
  },
};

export const Success: Story = {
  args: {
    connector: {
      isSubmitSuccessful: true,
      isLinkError: false,
      isError: false,
    },
  },
};

export const LinkError: Story = {
  args: {
    connector: {
      isSubmitSuccessful: false,
      isLinkError: true,
      isError: false,
    },
  },
};

export const Error: Story = {
  args: {
    connector: {
      isSubmitSuccessful: false,
      isLinkError: false,
      isError: true,
    },
  },
};
