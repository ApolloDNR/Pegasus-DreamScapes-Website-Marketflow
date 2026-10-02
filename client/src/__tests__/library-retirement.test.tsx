import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Redirect, Route, Router, Switch, useLocation } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { legacyRedirects } from "@/LegacyApp";
import { NAV_MORE } from "@/config/navigation";
import { isNotFoundUrl } from "@/pegasus/routes";
import {
  ROBOTS_DISALLOW,
  SEO_ROUTES,
  isCrawlablePublicPath,
  seoFor,
} from "@shared/seo-routes";

function LocationProbe({ sink }: { sink: { current: string } }) {
  const [location] = useLocation();
  sink.current = location;
  return null;
}

function renderRedirect(path: string) {
  const sink = { current: path };
  const { hook } = memoryLocation({ path });
  render(
    <Router hook={hook}>
      <LocationProbe sink={sink} />
      <Switch>
        {legacyRedirects.map(([from, to]) => (
          <Route key={from} path={from}>
            {() => <Redirect to={to} />}
          </Route>
        ))}
        <Route path="/strategy-lab">
          {() => <div data-testid="strategy-lab" />}
        </Route>
        <Route path="/saved">
          {() => <div data-testid="saved-work" />}
        </Route>
      </Switch>
    </Router>,
  );
  return sink;
}

afterEach(cleanup);

describe("retired public Strategy Library", () => {
  it.each([
    "/library",
    "/library/fixture-article",
    "/resources",
    "/education",
    "/strategy-library",
  ])("redirects %s directly to Strategy Lab in the browser", async (path) => {
    const sink = renderRedirect(path);
    await waitFor(() => expect(sink.current).toBe("/strategy-lab"));
  });

  it("removes deep library paths from SPA ownership and SEO fallback", () => {
    expect(isNotFoundUrl("/library/fixture-article")).toBe(true);
    expect(SEO_ROUTES["/library"]).toBeUndefined();
    expect(seoFor("/library/fixture-article")).toEqual(SEO_ROUTES["/"]);
  });

  it("excludes the bare library path and descendants from crawling", () => {
    expect(isCrawlablePublicPath("/library")).toBe(false);
    expect(isCrawlablePublicPath("/library/fixture-article")).toBe(false);
    expect(ROBOTS_DISALLOW).toContain("/library");
  });

  it("removes the retired library from visible legacy navigation data", () => {
    expect(NAV_MORE.some((item) => item.href === "/library")).toBe(false);
  });

  it("redirects the obsolete account library to the real saved-work surface", async () => {
    const sink = renderRedirect("/strategy-lab/library");
    await waitFor(() => expect(sink.current).toBe("/saved"));
  });
});
