import StudioBanner from "~/assets/images/applications/studio-banner.png";
import StudioBackground from "~/assets/images/applications/studio-bg.png";
import { AgoraApplications } from "~/components/navigation";

import { LayoutRenderer } from "../renderer";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof AgoraApplications> = {
  component: AgoraApplications,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  render: (args) => (
    <LayoutRenderer>
      <AgoraApplications {...args} />
    </LayoutRenderer>
  ),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    applications: [
      {
        name: "studio",
        banner: StudioBanner,
        background: StudioBackground,
        link: import.meta.env.VITE_PLATFORM_STUDIO_URL!,
      },
      {
        name: "studio",
        banner: StudioBanner,
        background: StudioBackground,
        link: import.meta.env.VITE_PLATFORM_STUDIO_URL!,
      },
      {
        name: "studio",
        banner: StudioBanner,
        background: StudioBackground,
        link: import.meta.env.VITE_PLATFORM_STUDIO_URL!,
      },
    ],
  },
};
