import StudioBanner from "~/assets/images/applications/studio-banner.png";
import StudioBackground from "~/assets/images/applications/studio-bg.png";

import { Section } from "@a-novel/package-ui/mui/components";
import { SPACINGS } from "@a-novel/package-ui/mui/utils";
import { WithTolgeeNs } from "@a-novel/package-ui/translations";

import { Box, Grid, Stack, Typography } from "@mui/material";
import { T } from "@tolgee/react";

export const AgoraApplications = WithTolgeeNs(InnerAgoraApplications, "platform.authentication.dashboard");

export interface AgoraApplicationElement {
  name: string;
  banner: string;
  background: string;
  link: string;
}

export interface AgoraApplicationsProps {
  applications?: AgoraApplicationElement[];
}

export const AGORA_DEFAULT_APPLICATIONS: AgoraApplicationElement[] = [
  {
    name: "studio",
    banner: StudioBanner,
    background: StudioBackground,
    link: import.meta.env.VITE_PLATFORM_STUDIO_URL!,
  },
];

function InnerAgoraApplications({ applications = AGORA_DEFAULT_APPLICATIONS }: AgoraApplicationsProps) {
  return (
    <Section
      direction="column"
      padding={SPACINGS.LARGE}
      gap={SPACINGS.LARGE}
      width="xl"
      maxWidth="100%"
      alignSelf="center"
    >
      <Typography variant="h2" color="primary">
        <T keyName="applications.title" ns="platform.authentication.dashboard" />
      </Typography>

      <Grid alignSelf="stretch" container spacing={SPACINGS.MEDIUM} columns={{ xs: 6, sm: 6, lg: 12 }}>
        {applications.map((app) => (
          <Grid size={6} key={app.name}>
            <Stack
              component="a"
              href={app.link}
              direction="column"
              alignItems="center"
              justifyContent="center"
              padding={SPACINGS.MEDIUM}
              gap={SPACINGS.SMALL}
              height="12lh"
              overflow="auto"
              borderRadius={SPACINGS.MEDIUM}
              position="relative"
              sx={{
                background: `url(${app.background})`,
                backgroundSize: "cover",
                cursor: "pointer",
                // Make scrollbar invisible.
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
                msOverflowStyle: "none",
                " > .agora-shader": {
                  backdropFilter: "brightness(30%) saturate(40%)",
                },
                " > .agora-app-logo": {
                  opacity: 1,
                },
              }}
            >
              <Box
                className="agora-shader"
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                zIndex={0}
                borderRadius="inherit"
                sx={{ transition: "ease-out 0.2s" }}
              />
              <Box
                className="agora-app-logo"
                component="img"
                src={app.banner}
                height="3lh"
                width="auto"
                alt={`${app.name} banner`}
                zIndex={10}
                sx={{ transition: "ease-out 0.2s" }}
              />
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}
