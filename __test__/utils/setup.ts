import { MockReplyHeaders } from "#/mocks/query_client";

import { init as initAuthAPI } from "@a-novel/connector-authentication";
import { init as initAuthenticator } from "@a-novel/package-authenticator";

import nock from "nock";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

export interface GenericSetupProps {
  setNockAPI?: (scope: nock.Scope) => void;
}

beforeAll(() => {
  initAuthAPI({ baseURL: "http://localhost:8081" });
  initAuthenticator({});

  if (!nock.isActive()) nock.activate();

  nock.emitter.on("no match", (req) => {
    throw new Error(
      `Unexpected request was sent to ${req.method} ${req.path}\n${JSON.stringify(req.options, null, 2)}`
    );
  });
});

afterAll(() => {
  nock.restore();
});

export const genericSetup = (props: GenericSetupProps) => {
  beforeEach(() => {
    // Objects are passed by reference in javascript, so this will update the actual value from the source.
    props.setNockAPI?.(nock("http://localhost:8081").defaultReplyHeaders(MockReplyHeaders));
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    nock.cleanAll();
  });
};
