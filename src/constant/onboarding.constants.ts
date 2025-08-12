export const onboardingConstants = {
  EMAIL: {
    LABEL: "Email Address",
    PLACEHOLDER: "Email Address",
    ERROR: "Please enter correct Email",
  },
  REQUIRED_ERROR_MESSAGE: "Please fill in this field",
  PASSWORD: {
    LABEL: "Password",
    NAME: "password",
    TYPE: "password",
    PLACEHOLDER: "Enter password",
    ERROR_MESSAGE: "Please input your password!",
    MIN_LENGTH_ERROR: "Password must be at least 8 characters",
    LOWERCASE_ERROR: "Password must contain at least one lowercase letter",
    UPPERCASE_ERROR: "Password must contain at least one uppercase letter",
    SPECIAL_CHARACTER_ERROR:
      "Password must contain at least one special character (@, $, !, %, *, ?, &)",
  },
  CONFIGURE_MFA: {
    TITLE: "Configure MFA",
    SUBTITLE:
      "Scan the image with two-factor authentication app on your device.",
    CONFIG_MFA_TEXT: "Enter code for the application",
    CONFIG_MFA_TEXT2:
      "After scanning the QR code image, the app will display a code that you can enter below.",
    SUBMIT: "Submit",
    CANCEL: "Cancel"
  },
  LOGIN: {
    TITLE: "Login in to your account",
    SUBTITLE: "Hi, Enter your details to get sign in to your account",
    USERNAME: {
      LABEL: "Email",
      NAME: "username",
      TYPE: "text",
      PLACEHOLDER: "Enter email",
      ERROR_MESSAGE: "Please input your email!",
    },
    FORGOT_PASSWORD: "Forgot password?",
    BUTTON_LABEL: "Login",
    SIGNUP_MESSAGE: "Don't have account yet?",
    SIGNUP_LABEL: "Sign up",
  },
  LOGIN_MFA: {
    TITLE: "Verify code",
    SUBTITLE: "Enter 6-digit code from two factor auth APP. ",
    VERIFY_BTN_LABEL: "Verify",
    CANCEL_BTN_LABEL: "Cancel",
    MFA_SETUP_MESSAGE: "MFA device is lost?",
    MFA_SETUP_LINK: "Click here",
  },
  SIGNUP: {
    TITLE: "Sign up",
    FIRSTNAME: {
      LABEL: "First Name",
      PLACEHOLDER: "First Name",
    },
    LASTNAME: {
      LABEL: "Last Name",
      PLACEHOLDER: "Last Name",
    },
    CONFIRMPASSWORD: {
      LABEL: "Confirm Password",
      PLACEHOLDER: "Enter confirm password",
      MISMATCH_ERROR_MESSAGE: "Password does not match!",
    },
  },
  ERROR_MESSAGE: "Oops! Something went wrong",
  FORGET_PASSWORD: {
    TITLE: "Forgot password?",
    BUTTON_LABEL: "Send password reset mail",
    SUBTITLE:
      "Enter your user account's verified email address and we will send you a password reset link.",
  },
};
