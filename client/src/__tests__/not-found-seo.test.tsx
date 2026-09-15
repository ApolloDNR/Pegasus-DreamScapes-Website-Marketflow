import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import NotFound from "@/pages/not-found";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

describe("client 404 page", () => {
  it("uses the memory-router missing path for noindex metadata when the browser location is still home", async () => {
    window.history.replaceState({}, "", "/");
    document.head.innerHTML =
      '<meta name="robots" content="index, follow" />' +
      '<link rel="canonical" href="https://pegasusdreamscapes.com/" />';
    const memory = memoryLocation({ path: "/definitely-missing" });

    expect(window.location.pathname).toBe("/");

    render(
      <Router hook={memory.hook}>
        <NotFound />
      </Router>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Page Not Found · Pegasus Dreamscapes");
      expect(
        document.head
          .querySelector('meta[name="robots"]')
          ?.getAttribute("content"),
      ).toMatch(/^noindex, nofollow/);
      expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    });
    expect(
      screen.getByRole("link", { name: /bring an opportunity/i }),
    ).toHaveAttribute("href", "/bring-an-opportunity");
  });
});
