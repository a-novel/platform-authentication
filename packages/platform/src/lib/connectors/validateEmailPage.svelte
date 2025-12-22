<script lang="ts">
  import { ValidateEmailPage } from "$lib/ui";

  import { type ComponentProps } from "svelte";

  import { isHttpStatusError } from "@a-novel-kit/nodelib-browser/http";
  import { getSession } from "@a-novel/package-authentication";
  import {
    type AuthenticationApi,
    CredentialsUpdateEmailRequestSchema,
    credentialsUpdateEmail,
  } from "@a-novel/service-authentication-rest";

  // ===================================================================================================================
  // Props.
  // ===================================================================================================================
  interface Props {
    api: AuthenticationApi;
    shortCode: string;
    userID: string;
    email: string;
  }

  let { api, shortCode, userID, email }: Props = $props();

  // ===================================================================================================================
  // Stores & dependencies.
  // ===================================================================================================================
  const session = getSession();

  // ===================================================================================================================
  // States.
  // ===================================================================================================================
  type FormStatus = ComponentProps<typeof ValidateEmailPage>["status"];

  let // Form status.
    formStatus = $state<FormStatus>("loading"),
    formError = $state<Error>();

  // ===================================================================================================================
  // Helpers.
  // ===================================================================================================================
  // Statuses
  interface ValidateEmailStatus {
    status: FormStatus;
    error?: Error;
  }

  function setFormStatus(params?: ValidateEmailStatus) {
    formStatus = params?.status ?? "loading";
    formError = params?.error;
  }

  function resetAllStatuses() {
    formStatus = "loading";
    formError = undefined;
  }

  // Handlers.
  async function onsubmit() {
    resetAllStatuses();

    const formData = await CredentialsUpdateEmailRequestSchema.safeParseAsync({
      shortCode,
      userID,
    });

    if (!formData.success) {
      setFormStatus({ status: "error" });
      return;
    }

    await credentialsUpdateEmail(api, session.accessToken, formData.data)
      .then(() => {
        setFormStatus({ status: "success" });
      })
      .catch((err) => {
        if (isHttpStatusError(err, 403)) {
          setFormStatus({ status: "error" });
        } else {
          setFormStatus({ status: "internal-error", error: err });
        }
      });
  }

  // ===================================================================================================================
  // Run.
  // ===================================================================================================================
  $effect(() => {
    onsubmit();
  });
</script>

<ValidateEmailPage status={formStatus} error={formError} {email} />
