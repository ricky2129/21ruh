import React, { useState } from "react";

import { SignupFormFieldType } from "interfaces";

import { SignupForm } from "components";
import { ConfigureMfa, SignupSuccess } from "components/Signup";

const Signup: React.FC = () => {
  const [signupCurrentTab, setSignupCurrentTab] = useState<number>(0);
  const [signupFields, setSignupFields] = useState<SignupFormFieldType>(
    {} as SignupFormFieldType,
  );

  const [qr, setQr] = useState<Blob | null>(null);

  return signupCurrentTab === 0 ? (
    <SignupForm
      setSignupCurrentTab={setSignupCurrentTab}
      signupFields={signupFields}
      setSignupFields={setSignupFields}
      setQr={setQr}
    />
  ) : signupCurrentTab === 1 ? (
    <ConfigureMfa
      setSignupCurrentTab={setSignupCurrentTab}
      signupFields={signupFields}
      qr={qr}
    />
  ) : signupCurrentTab === 2 ? (
    <SignupSuccess
      setSignupCurrentTab={setSignupCurrentTab}
      email={signupFields.email}
    />
  ) : (
    ""
  );
};

export default Signup;
