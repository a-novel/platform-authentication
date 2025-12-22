import { PUBLIC_AUTHENTICATION_SERVICE_URL } from "$env/static/public";

import { AuthenticationApi } from "@a-novel/service-authentication-rest";

export const authenticationApi = new AuthenticationApi(PUBLIC_AUTHENTICATION_SERVICE_URL);
