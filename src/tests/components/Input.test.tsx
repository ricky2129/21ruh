import { render } from "@testing-library/react";
import { describe, it } from "vitest";

import { Input } from "components";

describe("Input component", () => {
  it("renders correctly", () => {
    render(<Input placeholder="help" type="text" customClass="class" />);
  });
});
