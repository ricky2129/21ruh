import queryClient from "react-query/reactQueryClient";
import { MemoryRouter } from "react-router-dom";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { onboardingConstants } from "constant";
import { Mock, describe, expect, it, vi } from "vitest";

import { LoginForm } from "components";

import AuthProvider, * as useAuthHooks from "context/AuthProvider";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("axios");

describe("LoginForm component", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  });

  it("test field change", () => {
    const loginForm = render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    const { LOGIN } = onboardingConstants;

    const email = loginForm.getByPlaceholderText(LOGIN.USERNAME.PLACEHOLDER);
    fireEvent.change(email, { target: { value: "someValue@gmail.com" } });

    expect(email).toHaveValue("someValue@gmail.com");
  });

  it("test field change to incorrect value", () => {
    const loginForm = render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    const { LOGIN } = onboardingConstants;
    const email = loginForm.getByPlaceholderText(LOGIN.USERNAME.PLACEHOLDER);
    const submit = screen.getByRole("button", {
      name: /Login/i,
    });

    fireEvent.change(email, { target: { value: "someValue" } });

    expect(email).toHaveValue("someValue");
    expect(submit).toBeDisabled();
  });

  it("test submit with value", () => {
    global.fetch = vi.fn(() => {
      Promise.resolve({
        json: () =>
          Promise.resolve({
            access_token: "124",
            refresh_token: "12345",
          }),
      });
    }) as Mock;

    const loginForm = render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    const { LOGIN, PASSWORD } = onboardingConstants;
    const email = loginForm.getByPlaceholderText(LOGIN.USERNAME.PLACEHOLDER);
    const password = loginForm.getByPlaceholderText(PASSWORD.PLACEHOLDER);

    const submit = screen.getByRole("button", {
      name: /Login/i,
    });

    fireEvent.change(email, { target: { value: "someValue@gmail.com" } });
    fireEvent.change(password, { target: { value: "12345" } });

    act(() => {
      fireEvent.click(submit);
    });

    expect(email).not.toBeInTheDocument();
  });

  // TODO : Test breaking build, Fix required

  // it("show alert on error", () => {
  //   const useAuthMock = vi.spyOn(useAuthHooks, "useAuth");
  //   useAuthMock.mockReturnValue({
  //     signu: vi.fn(),
  //     login: vi.fn(),
  //     logout: vi.fn(),
  //     reset: vi.fn(),
  //     track: vi.fn(),
  //     isAuthenticated: false,
  //     isLoggedOut: false,
  //     errorMessage: "Error",
  //     isLoading: false,
  //     isError: true,
  //   });

  //   const loginForm = render(
  //     <MemoryRouter>
  //       <QueryClientProvider client={queryClient}>
  //           <LoginForm />
  //       </QueryClientProvider>
  //     </MemoryRouter>,
  //   );

  //   const error = loginForm.getByText("Error");
  //   expect(error).toBeInTheDocument();
  // });
});
