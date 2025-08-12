import { render } from "@testing-library/react";
import { describe, it } from "vitest";

import {  OrganizationCard } from "components";

describe("Organization component", () => {
  it("renders correctly", () => {
    render(<OrganizationCard />);
  });
});
