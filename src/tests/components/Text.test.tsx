import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Text } from "components";

describe("Text component", () => {
  it("should renders correctly", () => {
    const { getByText } = render(<Text text="Hello" />);
    expect(getByText("Hello")).toBeInTheDocument();
  });

  it("should renders with correct type", () => {
    const { getByText } = render(<Text text="Hello" type="cardtitle" />);
    const text = getByText("Hello");
    expect(text).toHaveClass("cardtitle");
  });

  it("should renders with header1 type", () => {
    const { getByText } = render(<Text text="Hello" type="header1" />);
    const text = getByText("Hello");
    expect(text).toHaveClass("header1");
  });

  it("should renders with correct weight", () => {
    const { getByText } = render(<Text text="Hello" weight="bold" />);
    const text = getByText("Hello");
    expect(text).toHaveClass("bold");
  });

  it("renders with correct customClass", () => {
    const { getByText } = render(<Text text="Hello" customClass="test" />);
    const text = getByText("Hello");
    expect(text).toHaveClass("test");
  });
});
