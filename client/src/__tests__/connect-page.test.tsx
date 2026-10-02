import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { ConnectChooser } from "@/pages/connect";

function renderContactChooser() {
  const { hook } = memoryLocation({ path: "/contact", static: true });
  return render(
    <Router hook={hook}>
      <ConnectChooser />
    </Router>,
  );
}

afterEach(() => cleanup());

describe("Contact direct paths", () => {
  it("makes all eight destinations available in a single activation", () => {
    renderContactChooser();
    const paths = {
      'property-situation': '/bring-an-opportunity?intent=property',
      representation: '/work-with-apollo', 'buyer-investor': '/buyers',
      'deal-finder': '/deal-partners', build: '/development', capital: '/capital',
      vendor: '/vendor-network', 'not-sure': 'mailto:apollo@pegasusdreamscapes.com',
    };
    for (const [id, href] of Object.entries(paths)) {
      expect(screen.getByTestId(`link-connect-${id}`)).toHaveAttribute('href', href);
    }
    expect(screen.getByRole('link', { name: /Tools.*Model/ })).toHaveAttribute('href', '/tools');
    expect(screen.queryByTestId('connect-active-lane')).not.toBeInTheDocument();
  });
});
