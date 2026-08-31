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

describe("Contact chooser route card", () => {
  it("starts on the property route and updates when a lane is selected", () => {
    renderContactChooser();

    const activeLane = screen.getByTestId("connect-active-lane");
    expect(within(activeLane).getByText("PROPERTY READ")).toBeInTheDocument();
    expect(
      within(activeLane).getByText("I need to sell or solve a property situation"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-connect-lane-buyer-investor"));

    expect(within(activeLane).getByText("BUYER READ")).toBeInTheDocument();
    expect(within(activeLane).getByText("I am buying or investing")).toBeInTheDocument();
    expect(screen.getByTestId("link-connect-active-buyer-investor")).toHaveAttribute(
      "href",
      "/buyers",
    );
  });
});
