"use client";

import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Form,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from "@heroui/react";
import { Autocomplete, AutocompleteItem, InputOtp, Alert, addToast } from "@heroui/react";


import {
  sendOtpAction,
  verifyOtpAction,
  completeProfileAction,
} from "@/actions/auth";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Country, State, City } from "country-state-city";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@heroui/shared-icons";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scrollBehavior] = useState("inside");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pendingEmail, setPendingEmail] = useState("");

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(
    () => (selectedCountry ? State.getStatesOfCountry(selectedCountry) : []),
    [selectedCountry],
  );
  const cities = useMemo(
    () =>
      selectedState
        ? City.getCitiesOfState(selectedCountry, selectedState)
        : [],
    [selectedCountry, selectedState],
  );

  const getPasswordError = (value: string) => {
    if (value.length < 8) {
      return "Password must be 8 characters or more";
    }
    if ((value.match(/[A-Z]/g) || []).length < 1) {
      return "Password needs at least 1 uppercase letter";
    }
    if ((value.match(/[0-9]/g) || []).length < 1) {
      return "Password needs at least 1 number";
    }
    return null;
  };

  async function handleStep1(formData: FormData) {
    const emailValue = formData.get("email") as string;
    setPendingEmail(emailValue);
    onOpen();
  }

  async function acceptTermsAndContinue() {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", pendingEmail);

    try {
      const result = await sendOtpAction(formData);

      if (result?.error) {
        setError(result.error);
        addToast({
          title: "Error",
          description: result.error,
          color: "danger",
        });
        setLoading(false);
      } else {
        setEmail(pendingEmail);
        addToast({
          title: "Success",
          description: "Verification code sent to your email",
          color: "success",
        });
        setStep(2);
        setLoading(false);
      }
    } catch (error) {
      setError("An error occurred");
      setLoading(false);
    }
  }

  async function handleStep2(formData: FormData) {
    setLoading(true);
    setError("");

    formData.append("email", email);

    try {
      const result = await verifyOtpAction(formData);

      if (result?.error) {
        setError(result.error);
        addToast({
          title: "Error",
          description: result.error,
          color: "danger",
        });
        setLoading(false);
      } else {
        addToast({
          title: "Success",
          description: "Email verified successfully",
          color: "success",
        });
        setStep(3);
        setLoading(false);
      }
    } catch (error) {
      setError("An error occurred");
      setLoading(false);
    }
  }

  async function handleStep3(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    // Validation
    const newErrors: Record<string, string> = {};

    // First Name validation (2-50 characters, letters only)
    const firstName = (data.firstName as string).trim();
    if (!firstName) {
      newErrors.firstName = "First name is required";
    } else if (firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (firstName.length > 50) {
      newErrors.firstName = "First name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
      newErrors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Last Name validation (2-50 characters, letters only)
    const lastName = (data.lastName as string).trim();
    if (!lastName) {
      newErrors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (lastName.length > 50) {
      newErrors.lastName = "Last name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
      newErrors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Username validation (3-30 characters, alphanumeric and underscore)
    const username = (data.username as string).trim();
    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (username.length > 30) {
      newErrors.username = "Username must not exceed 30 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Phone validation (optional, 10-15 digits)
    const phone = (data.phone as string).trim();
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone.replace(/[\s()-]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    // Country validation
    if (!selectedCountry) {
      newErrors.country = "Please select a country";
    }

    // Address validation (optional, max 200 characters)
    const address = (data.address as string)?.trim() || '';
    if (address && address.length > 200) {
      newErrors.address = "Address must not exceed 200 characters";
    }

    // Password validation
    const passwordError = getPasswordError(data.password as string);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Add email to form data
    formData.append("email", email);

    try {
      const result = await completeProfileAction(formData);

      if (result?.error) {
        const errorMsg = result.error.toLowerCase();
        
        // Map server errors to specific fields
        if (errorMsg.includes('username') && errorMsg.includes('unique')) {
          newErrors.username = "This username is already taken";
        } else if (errorMsg.includes('email') && errorMsg.includes('unique')) {
          setError("This email is already registered");
        } else if (errorMsg.includes('phone')) {
          newErrors.phone = "Invalid phone number format";
        } else if (errorMsg.includes('country')) {
          newErrors.country = "Please select a valid country";
        } else {
          setError(result.error);
        }

        // Show field-specific errors or general error
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        }

        addToast({
          title: "Error",
          description: Object.keys(newErrors).length > 0 
            ? "Please fix the errors in the form" 
            : result.error,
          color: "danger",
        });
        setLoading(false);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      addToast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        color: "danger",
      });
      setLoading(false);
    }
  }

  if (step === 1) {
    return (
      <>
        <div className="min-h-full flex items-center justify-center py-7 relative">
          <Card isBlurred shadow="none" className="w-full max-w-md">
            <CardHeader className="flex flex-col gap-2 items-start pb-6">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-sm text-default-600">
                Step 1 of 3: Enter your email
              </p>
            </CardHeader>
            <CardBody className="gap-6">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleStep1(formData);
                }}
                className="space-y-6"
              >
                <Input
                  name="email"
                  type="email"
                  label="Enter Email"
                  placeholder="you@example.com"
                  isRequired
                  errorMessage={({ validationDetails }) => {
                    if (validationDetails.valueMissing)
                      return "Please enter your email";
                    if (validationDetails.typeMismatch)
                      return "Please enter a valid email";
                  }}
                />

                <Button
                  type="submit"
                  color="primary"
                  className="w-full"
                  isLoading={loading}
                >
                  Continue
                </Button>
              </Form>

              <Divider />

              <div className="text-center">
                <p className="text-sm text-default-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          size="2xl"
          isDismissable={false}
          scrollBehavior={scrollBehavior as "inside" | "outside"}
          backdrop="opaque"
          classNames={{
            backdrop:
              "bg-linear-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Terms and Conditions & Privacy Policy
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        Terms and Conditions
                      </h3>
                      <div className="space-y-3 text-sm text-default-600">
                        <p>
                          <strong>1. Acceptance of Terms</strong>
                          <br />
                          By accessing and using SyncTrade, you accept and
                          agree to be bound by the terms and provision of this
                          agreement.
                        </p>
                        <p>
                          <strong>2. Use License</strong>
                          <br />
                          Permission is granted to temporarily use SyncTrade
                          for personal, non-commercial transitory viewing only.
                          This is the grant of a license, not a transfer of
                          title.
                        </p>
                        <p>
                          <strong>3. Trading Risks</strong>
                          <br />
                          Cryptocurrency trading involves substantial risk of
                          loss. You acknowledge that you are aware of these
                          risks and are solely responsible for the outcomes of
                          your trading decisions.
                        </p>
                        <p>
                          <strong>4. Account Security</strong>
                          <br />
                          You are responsible for maintaining the
                          confidentiality of your account credentials and for
                          all activities that occur under your account.
                        </p>
                        <p>
                          <strong>5. KYC Requirements</strong>
                          <br />
                          You agree to provide accurate and complete information
                          during the KYC verification process and to update such
                          information as necessary.
                        </p>
                        <p>
                          <strong>6. Prohibited Activities</strong>
                          <br />
                          You may not use the platform for any illegal
                          activities, including but not limited to money
                          laundering, fraud, or market manipulation.
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        Privacy Policy
                      </h3>
                      <div className="space-y-3 text-sm text-default-600">
                        <p>
                          <strong>1. Information Collection</strong>
                          <br />
                          We collect information you provide directly to us,
                          including name, email address, phone number,
                          government-issued ID, and other KYC documents.
                        </p>
                        <p>
                          <strong>2. Use of Information</strong>
                          <br />
                          We use the information we collect to provide,
                          maintain, and improve our services, to process
                          transactions, and to comply with legal obligations.
                        </p>
                        <p>
                          <strong>3. Information Sharing</strong>
                          <br />
                          We do not share your personal information with third
                          parties except as necessary to provide our services,
                          comply with the law, or protect our rights.
                        </p>
                        <p>
                          <strong>4. Data Security</strong>
                          <br />
                          We implement appropriate technical and organizational
                          measures to protect your personal information against
                          unauthorized access, alteration, disclosure, or
                          destruction.
                        </p>
                        <p>
                          <strong>5. Data Retention</strong>
                          <br />
                          We retain your personal information for as long as
                          necessary to fulfill the purposes outlined in this
                          privacy policy, unless a longer retention period is
                          required by law.
                        </p>
                        <p>
                          <strong>6. Your Rights</strong>
                          <br />
                          You have the right to access, correct, or delete your
                          personal information. You may also object to or
                          restrict certain processing of your data.
                        </p>
                      </div>
                    </section>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onPress={() => {
                      onClose();
                      acceptTermsAndContinue();
                    }}
                    isLoading={loading}
                  >
                    Accept and Continue
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-full flex items-center justify-center py-7">
        <Card isBlurred shadow="none" className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-2 items-start pb-6">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-sm text-default-600">
              Step 2 of 3: Enter the code sent to {email}
            </p>
          </CardHeader>
          <CardBody className="gap-6">
            <Alert
              color="primary"
              variant="faded"
              className="text-xs"
              title="Check your email"
            >
              We sent a 6-digit verification code to {email}
            </Alert>

            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleStep2(formData);
              }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Verification Code</label>
                <InputOtp name="token" length={6} size="lg" isRequired />
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={loading}
              >
                Verify
              </Button>
            </Form>

            <Divider />

            <div className="text-center">
              <p className="text-sm text-default-600">
                Didn't receive the code?{" "}
                <Button
                  variant="light"
                  size="sm"
                  color="primary"
                  onPress={async () => {
                    setLoading(true);
                    const formData = new FormData();
                    formData.append("email", email);
                    const result = await sendOtpAction(formData);
                    if (result?.error) {
                      addToast({
                        title: "Error",
                        description: result.error,
                        color: "danger",
                      });
                    } else {
                      addToast({
                        title: "Success",
                        description: "New code sent to your email",
                        color: "success",
                      });
                    }
                    setLoading(false);
                  }}
                  isDisabled={loading}
                >
                  Resend code
                </Button>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-7 relative">
      <Card isBlurred shadow="none" className="w-full max-w-2xl">
        <CardHeader className="flex flex-col gap-2 items-start pb-6">
          <h1 className="text-2xl font-bold">Complete your profile</h1>
          <p className="text-sm text-default-600">
            Step 3 of 3: Tell us about yourself
          </p>
        </CardHeader>
        <CardBody className="gap-6">
          {error && (
            <Alert color="danger" title="Error" variant="flat">
              {error}
            </Alert>
          )}
          
          <Form
            validationErrors={errors}
            onSubmit={handleStep3}
            className="space-y-6 w-full"
          >
            <div className="w-full grid md:grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="First Name"
                isRequired
                maxLength={50}
                errorMessage={errors.firstName}
                isInvalid={!!errors.firstName}
                onValueChange={() => {
                  if (errors.firstName) {
                    const { firstName, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
              />
              <Input
                name="lastName"
                label="Last Name"
                isRequired
                maxLength={50}
                errorMessage={errors.lastName}
                isInvalid={!!errors.lastName}
                onValueChange={() => {
                  if (errors.lastName) {
                    const { lastName, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
              />
            </div>

            <Input
              name="username"
              label="Username"
              isRequired
              maxLength={30}
              description="3-30 characters, letters, numbers, and underscores only"
              errorMessage={errors.username}
              isInvalid={!!errors.username}
              onValueChange={() => {
                if (errors.username) {
                  const { username, ...rest } = errors;
                  setErrors(rest);
                }
              }}
            />
            <Input 
              name="phone" 
              type="tel" 
              label="Phone Number"
              maxLength={20}
              description="Optional: Include country code (e.g., +1234567890)"
              errorMessage={errors.phone}
              isInvalid={!!errors.phone}
              onValueChange={() => {
                if (errors.phone) {
                  const { phone, ...rest } = errors;
                  setErrors(rest);
                }
              }}
            />

            <Autocomplete
              label="Country"
              placeholder="Search country"
              isRequired
              errorMessage={errors.country}
              isInvalid={!!errors.country}
              onSelectionChange={(key) => {
                setSelectedCountry(key as string);
                setSelectedState("");
                if (errors.country) {
                  const { country, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              startContent={
                selectedCountry && (
                  <Avatar
                    alt={selectedCountry}
                    className="w-6 h-6"
                    src={`https://flagcdn.com/${selectedCountry.toLowerCase()}.svg`}
                  />
                )
              }
            >
              {countries.map((country) => (
                <AutocompleteItem
                  key={country.isoCode}
                  startContent={
                    <Avatar
                      alt={country.name}
                      className="w-6 h-6"
                      src={`https://flagcdn.com/${country.isoCode.toLowerCase()}.svg`}
                    />
                  }
                >
                  {country.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <input type="hidden" name="country" value={selectedCountry} />

            {states.length > 0 && (
              <Autocomplete
                label="State"
                placeholder="Search state"
                onSelectionChange={(key) => setSelectedState(key as string)}
              >
                {states.map((state) => (
                  <AutocompleteItem key={state.isoCode}>
                    {state.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}

            <input type="hidden" name="state" value={selectedState} />

            {cities.length > 0 && (
              <Autocomplete label="City" placeholder="Search city" name="city">
                {cities.map((city) => (
                  <AutocompleteItem key={city.name}>
                    {city.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}

            <Input 
              name="address" 
              label="Address"
              maxLength={200}
              description="Optional: Street address"
              errorMessage={errors.address}
              isInvalid={!!errors.address}
              onValueChange={() => {
                if (errors.address) {
                  const { address, ...rest } = errors;
                  setErrors(rest);
                }
              }}
            />

            <Input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              label="Password"
              isRequired
              value={password}
              onValueChange={setPassword}
              errorMessage={getPasswordError(password)}
              isInvalid={getPasswordError(password) !== null}
              endContent={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="focus:outline-none"
                >
                  {isPasswordVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />

            <Input
              name="confirmPassword"
              type={isConfirmVisible ? "text" : "password"}
              label="Confirm Password"
              // labelPlacement="outside"
              isRequired
              value={confirmPassword}
              onValueChange={(val) => {
                setConfirmPassword(val);
                if (errors.confirmPassword) {
                  const { confirmPassword, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              errorMessage={errors.confirmPassword}
              isInvalid={!!errors.confirmPassword}
              endContent={
                <button
                  type="button"
                  onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                  className="focus:outline-none"
                >
                  {isConfirmVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={loading}
            >
              Create Account
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
