import { render } from "@testing-library/react";
import { describe, it } from "vitest";

import { Loading } from "components";

describe("Loading component", () => {
  it("renders correctly", () => {
    render(<Loading size="large" />);
  });

  it("renders fullscreen correctly", () => {
    render(<Loading size="large" type="fullscreen"  />);
  });
});
