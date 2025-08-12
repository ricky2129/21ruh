import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vitest } from "vitest";

import { Button } from "components";

describe("Button component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<Button title="Click me" />);
    expect(getByText("Click me")).toBeInTheDocument();
  });

  it("renders with correct type", () => {
    render(<Button title="Click me" type="primary" />);

    const button = screen.getByRole("button")
    expect(button).toHaveClass("ant-btn-primary");

  });

  it("renders with correct htmlType", () => {
    render(<Button title="Click me" htmlType="submit" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("renders with correct loading state", () => {
    render(<Button title="Click me" loading={true} />);

    const button = screen.getByRole("button")
    
    expect(button).toHaveClass("ant-btn-loading");
  });

  // TODO : Test breaking build, Fix required

  //   it('renders with correct fullWidth state', () => {
  //     const { getByText } = render(<Button title="Click me" fullWidth />);
  //     const button = getByText('Click me');
  //     expect(button).toHaveAttribute('block', '');
  //   });

  it("calls onClick handler when clicked", () => {
    const onClick = vitest.fn();
    const { getByText } = render(<Button title="Click me" onClick={onClick} />);
    const button = getByText("Click me");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
