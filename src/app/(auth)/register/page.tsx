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
  Autocomplete,
  AutocompleteItem,
  Alert,
  addToast,
} from "@heroui/react";

import dynamic from "next/dynamic";
import {
  sendOtpAction,
  verifyOtpAction,
  completeProfileAction,
} from "@/actions/auth";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Country, State, City } from "country-state-city";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@heroui/shared-icons";

// ✅ Prevent SSR crash
const InputOtp = dynamic(
  () => import("@heroui/react").then((m) => m.InputOtp),
  { ssr: false }
);

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

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pendingEmail, setPendingEmail] = useState("");

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(
    () => (selectedCountry ? State.getStatesOfCountry(selectedCountry) : []),
    [selectedCountry]
  );
  const cities = useMemo(
    () =>
      selectedState
        ? City.getCitiesOfState(selectedCountry, selectedState)
        : [],
    [selectedCountry, selectedState]
  );

  const getPasswordError = (value: string) => {
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Must include uppercase letter";
    if (!/[0-9]/.test(value)) return "Must include a number";
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
        addToast({ title: "Error", description: result.error, color: "danger" });
      } else {
        setEmail(pendingEmail);
        setStep(2);
        addToast({
          title: "Success",
          description: "OTP sent to your email",
          color: "success",
        });
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2(formData: FormData) {
    setLoading(true);
    formData.append("email", email);

    try {
      const result = await verifyOtpAction(formData);

      if (result?.error) {
        addToast({ title: "Error", description: result.error, color: "danger" });
      } else {
        setStep(3);
        addToast({ title: "Verified", color: "success" });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStep3(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("email", email);

    try {
      const result = await completeProfileAction(formData);

      if (result?.error) {
        setError(result.error);
        addToast({ title: "Error", description: result.error, color: "danger" });
      } else {
        addToast({ title: "Account Created", color: "success" });
      }
    } catch {
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // ================= STEP 1 =================
  if (step === 1) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center py-7">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h1 className="text-2xl font-bold">Create your account</h1>
            </CardHeader>

            <CardBody>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStep1(new FormData(e.currentTarget));
                }}
              >
                <Input name="email" type="email" label="Email" isRequired />

                <Button type="submit" isLoading={loading} className="w-full mt-4">
                  Continue
                </Button>
              </Form>

              <Divider className="my-4" />

              <Link href="/login">Already have account?</Link>
            </CardBody>
          </Card>
        </div>

        {/* ✅ safer modal */}
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isDismissable={false}
          shouldBlockScroll
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Terms</ModalHeader>
                <ModalBody>Accept to continue</ModalBody>
                <ModalFooter>
                  <Button
                    onPress={() => {
                      onClose();
                      acceptTermsAndContinue();
                    }}
                    isLoading={loading}
                  >
                    Accept
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }

  // ================= STEP 2 =================
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center py-7">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-xl font-bold">Verify Email</h1>
          </CardHeader>

          <CardBody>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleStep2(new FormData(e.currentTarget));
              }}
            >
              {/* ✅ hydration safe */}
              {typeof window !== "undefined" && (
                <InputOtp name="token" length={6} />
              )}

              <Button type="submit" isLoading={loading} className="w-full mt-4">
                Verify
              </Button>
            </Form>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ================= STEP 3 =================
  return (
    <div className="min-h-screen flex items-center justify-center py-7">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <h1 className="text-2xl font-bold">Complete Profile</h1>
        </CardHeader>

        <CardBody>
          {error && <Alert color="danger">{error}</Alert>}

          <Form className="space-y-4" onSubmit={handleStep3}>
            <Input name="firstName" label="First Name" isRequired />
            <Input name="lastName" label="Last Name" isRequired />
            <Input name="username" label="Username" isRequired />

            <Input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              label="Password"
              value={password}
              onValueChange={setPassword}
              errorMessage={getPasswordError(password)}
              endContent={
                <button onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                  {isPasswordVisible ? <EyeSlashFilledIcon /> : <EyeFilledIcon />}
                </button>
              }
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Create Account
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}