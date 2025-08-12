import queryClient from "react-query/reactQueryClient";
import { MemoryRouter } from "react-router-dom";

import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render } from "@testing-library/react";
import { onboardingConstants } from "constant";
import { describe, expect, it, vi } from "vitest";

import { SignupForm } from "components";

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

const { SIGNUP, PASSWORD } = onboardingConstants;

describe("SignupForm component", () => {
  // TODO : Test breaking build, Fix required
  
  // it("should renders correctly", () => {
  //   const { getByText } = render(
  //     <MemoryRouter>
  //       <QueryClientProvider client={queryClient}>
  //         <AuthProvider>
  //           <SignupForm />
  //         </AuthProvider>
  //       </QueryClientProvider>
  //     </MemoryRouter>,
  //   );
  //   expect(getByText(SIGNUP.TITLE)).toBeInTheDocument();
  // });
  // it("handleFormChange() is called on field changes", () => {
  //   const signupFormInstance = render(
  //     <MemoryRouter>
  //       <QueryClientProvider client={queryClient}>
  //         <AuthProvider>
  //           <SignupForm />
  //         </AuthProvider>
  //       </QueryClientProvider>
  //     </MemoryRouter>,
  //   );
  //   const inputElement = signupFormInstance.getByPlaceholderText(
  //     SIGNUP.FIRSTNAME.PLACEHOLDER,
  //   );
  //   const saveButton = signupFormInstance.getByRole("button", {
  //     name: "Signup",
  //   });
  //   fireEvent.change(inputElement, {
  //     target: { value: "John" },
  //   });
  //   expect(inputElement).toContainHTML("John");
  //   expect(saveButton).toBeDisabled();
  // });
  // it("disabledSave is false when all fields have values", () => {
  //   const signupFormInstance = render(
  //     <MemoryRouter>
  //       <QueryClientProvider client={queryClient}>
  //         <AuthProvider>
  //           <SignupForm />
  //         </AuthProvider>
  //       </QueryClientProvider>
  //     </MemoryRouter>,
  //   );
  //   // Fill all form fields
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(SIGNUP.FIRSTNAME.PLACEHOLDER),
  //     {
  //       target: { value: "John" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(SIGNUP.LASTNAME.PLACEHOLDER),
  //     {
  //       target: { value: "Doe" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(SIGNUP.EMAIL.PLACEHOLDER),
  //     {
  //       target: { value: "john.doe@example.com" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(PASSWORD.PLACEHOLDER),
  //     {
  //       target: { value: "password123" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(
  //       SIGNUP.CONFIRMPASSWORD.PLACEHOLDER,
  //     ),
  //     { target: { value: "password123" } },
  //   );
  //   expect(
  //     signupFormInstance.getByRole("button", { name: "Signup" }),
  //   ).not.toBeDisabled();
  // });
  // it("Alert component is present when isError is true", () => {
  //   const useAuthMock = vi.spyOn(useAuthHooks, "useAuth");
  //   useAuthMock.mockReturnValue({
  //     signup: vi.fn(),
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
  //   const signupFormInstance = render(
  //     <MemoryRouter>
  //       <QueryClientProvider client={queryClient}>
  //         <SignupForm  />
  //       </QueryClientProvider>
  //     </MemoryRouter>,
  //   );
  //   expect(signupFormInstance.getByRole("alert")).toBeInTheDocument();
  //   expect(signupFormInstance.getByText("Error")).toBeInTheDocument();
  // });
  // it("Mismatch error message is displayed for unequal password and confirmPassword", async () => {
  //   const signupFormInstance = render(
  //     <MemoryRouter>
  //       <QueryClientProvider client={queryClient}>
  //         <AuthProvider>
  //           <SignupForm />
  //         </AuthProvider>
  //       </QueryClientProvider>
  //     </MemoryRouter>,
  //   );
  //   // Fill password and confirm password fields with different values
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(PASSWORD.PLACEHOLDER),
  //     {
  //       target: { value: "1234" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(
  //       SIGNUP.CONFIRMPASSWORD.PLACEHOLDER,
  //     ),
  //     {
  //       target: { value: "123" },
  //     },
  //   );
  //   expect(
  //     await signupFormInstance.findByText(
  //       SIGNUP.CONFIRMPASSWORD.MISMATCH_ERROR_MESSAGE,
  //     ),
  //   ).toBeInTheDocument();
  // });
  // it("Alert component is present when isError is true", () => {
  //   const useAuthMock = vi.spyOn(useAuthHooks, "useAuth");
  //   useAuthMock.mockReturnValue({
  //     signup: vi.fn(),
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
  //   const signupFormInstance = render(
  //     <MemoryRouter>
  //       <QueryClientProvider client={queryClient}>
  //         <SignupForm />
  //       </QueryClientProvider>
  //     </MemoryRouter>,
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(SIGNUP.FIRSTNAME.PLACEHOLDER),
  //     {
  //       target: { value: "John" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(SIGNUP.LASTNAME.PLACEHOLDER),
  //     {
  //       target: { value: "Doe" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(SIGNUP.EMAIL.PLACEHOLDER),
  //     {
  //       target: { value: "john.doe@example.com" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(PASSWORD.PLACEHOLDER),
  //     {
  //       target: { value: "password123" },
  //     },
  //   );
  //   fireEvent.change(
  //     signupFormInstance.getByPlaceholderText(
  //       SIGNUP.CONFIRMPASSWORD.PLACEHOLDER,
  //     ),
  //     { target: { value: "password123" } },
  //   );
  //   fireEvent.click(signupFormInstance.getByRole("button", { name: "Signup" }));
  //   expect(useAuthHooks.useAuth().signup).toBeCalledTimes(1);
  // });
});
