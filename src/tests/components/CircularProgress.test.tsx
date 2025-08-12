import {  render} from "@testing-library/react";
import { describe, it } from "vitest";

import { CircularProgress } from "components";

describe("Circular progress component", () => {
  it("renders correctly", () => {
    render(<CircularProgress percentage={20} diameter={20}  />);
  });

  it("renders correctly when percentage is between 25-70", () => {
    render(<CircularProgress percentage={28} diameter={20} />)
  })

  it("renders correctly when percentage is <=70", () => {
    render(<CircularProgress percentage={71} diameter={20} />)
  })
})
