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

import Image from "next/image";
import dynamic from "next/dynamic";
import {
  sendOtpAction,
  verifyOtpAction,
  completeProfileAction,
} from "@/actions/auth";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Country, State, City } from "country-state-city";
import { Eye, EyeOff } from "lucide-react";

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
      <div className="w-full">
        <Card shadow="none" className="bg-transparent dark:bg-transparent border-none px-0">
          <CardHeader className="flex flex-col items-center px-0 pt-0 pb-8 space-y-6 text-center">
            <Link href="/" className="transition-transform hover:scale-105 flex flex-col items-center gap-2">
              {/* New Dynamic Logo */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110" />
                <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)]">
                  <path 
                      d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                      fill="url(#reg-logo-1)" 
                  />
                  <path 
                      d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                      fill="url(#reg-logo-2)" 
                  />
                  <defs>
                      <linearGradient id="reg-logo-1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7eb2bd" />
                          <stop offset="100%" stopColor="#33525c" />
                      </linearGradient>
                      <linearGradient id="reg-logo-2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a9ccd3" />
                          <stop offset="100%" stopColor="#5399a7" />
                      </linearGradient>
                  </defs>
                </svg>
              </div>
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Create Account
              </h1>
              <p className="text-sm text-default-500 font-medium tracking-wide">
                Join our institutional trading network
              </p>
            </div>
          </CardHeader>

          <CardBody className="gap-8 p-0 mt-4">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleStep1(new FormData(e.currentTarget));
              }}
              className="space-y-6"
            >
              <Input 
                name="email" 
                type="email" 
                label="Email" 
                variant="flat"
                isRequired 
                labelPlacement="outside"
                placeholder="name@example.com"
                classNames={{
                  label: "text-xs font-bold text-default-600 ml-1",
                  inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                  input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
                }}
              />

              <Button 
                type="submit" 
                isLoading={loading} 
                className="w-full bg-[#33525c] text-white font-bold h-14 rounded-xl hover:scale-[1.01] transition-transform shadow-xl shadow-[#33525c]/20 mt-4"
              >
                Continue
              </Button>
            </Form>

            <Divider className="bg-black/5 dark:bg-white/5" />

            <div className="text-center pb-4">
              <span className="text-sm font-medium text-default-500 mr-2">
                Already have an account?
              </span>
              <Link 
                href="/login" 
                className="text-sm font-bold text-[#33525c] hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* ✅ Professional Seamless Modal */}
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isDismissable={false}
          shouldBlockScroll
          classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "bg-white dark:bg-black border-none shadow-none max-w-sm mx-4",
            header: "px-8 pt-8 pb-4",
            body: "px-8 py-0",
            footer: "px-8 pt-4 pb-8",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                   <h2 className="text-xl font-bold text-black dark:text-white">
                      Terms of Service
                   </h2>
                </ModalHeader>
                <ModalBody>
                  <p className="text-xs text-default-500 leading-relaxed font-medium">
                    By proceeding, you acknowledge the risk protocols of institutional trading. Performance data is historical and not guaranteed.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    className="w-full bg-[#33525c] text-white font-bold h-12 rounded-xl"
                    onPress={() => {
                      onClose();
                      acceptTermsAndContinue();
                    }}
                    isLoading={loading}
                  >
                    Accept & Continue
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    );
  }

  // ================= STEP 2 =================
  if (step === 2) {
    return (
      <div className="w-full">
        <Card shadow="none" className="bg-transparent dark:bg-transparent border-none px-0">
          <CardHeader className="flex flex-col items-center px-0 pt-0 pb-8 space-y-6 text-center">
            <Link href="/" className="transition-transform hover:scale-105 flex flex-col items-center gap-2">
              {/* New Dynamic Logo */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110" />
                <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)]">
                  <path 
                      d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                      fill="url(#reg-logo-3)" 
                  />
                  <path 
                      d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                      fill="url(#reg-logo-4)" 
                  />
                  <defs>
                      <linearGradient id="reg-logo-3" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7eb2bd" />
                          <stop offset="100%" stopColor="#33525c" />
                      </linearGradient>
                      <linearGradient id="reg-logo-4" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a9ccd3" />
                          <stop offset="100%" stopColor="#5399a7" />
                      </linearGradient>
                  </defs>
                </svg>
              </div>
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Verify Email
              </h1>
              <p className="text-sm text-default-500 font-medium tracking-wide">
                Verification code sent to {email}
              </p>
            </div>
          </CardHeader>

          <CardBody className="gap-8 p-0 mt-4">
            <Alert 
              color="primary" 
              variant="flat"
              className="bg-[#33525c]/10 text-[#33525c] border-none font-semibold text-xs"
            >
              Please enter the 6-digit code to continue
            </Alert>

            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleStep2(new FormData(e.currentTarget));
              }}
              className="space-y-6"
            >
              <div key="otp-container" className="flex justify-center py-4">
                {typeof window !== "undefined" && (
                  <InputOtp 
                    name="token" 
                    length={6} 
                    size="lg"
                    variant="flat"
                    classNames={{
                        input: "bg-black/5 dark:bg-white/5 border-none focus:ring-2 ring-[#33525c]/50"
                    }}
                  />
                )}
              </div>

              <Button 
                type="submit" 
                isLoading={loading} 
                className="w-full bg-[#33525c] text-white font-bold h-14 rounded-xl hover:scale-[1.01] transition-transform shadow-xl shadow-[#33525c]/20 mt-4"
              >
                Verify Code
              </Button>
            </Form>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ================= STEP 3 =================
  return (
    <div className="w-full">
      <Card shadow="none" className="bg-transparent dark:bg-transparent border-none px-0">
        <CardHeader className="flex flex-col items-center px-0 pt-0 pb-8 space-y-6 text-center">
          <Link href="/" className="transition-transform hover:scale-105 flex flex-col items-center gap-2">
            {/* New Dynamic Logo */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110" />
              <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)]">
                <path 
                    d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                    fill="url(#reg-logo-5)" 
                />
                <path 
                    d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                    fill="url(#reg-logo-6)" 
                />
                <defs>
                    <linearGradient id="reg-logo-5" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7eb2bd" />
                        <stop offset="100%" stopColor="#33525c" />
                    </linearGradient>
                    <linearGradient id="reg-logo-6" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a9ccd3" />
                        <stop offset="100%" stopColor="#5399a7" />
                    </linearGradient>
                </defs>
              </svg>
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Complete Profile
            </h1>
            <p className="text-sm text-default-500 font-medium tracking-wide">
              Tell us a bit more about yourself
            </p>
          </div>
        </CardHeader>

        <CardBody className="gap-8 p-0 mt-4 pb-12">
          {error && (
            <Alert 
              color="danger" 
              variant="flat" 
              className="font-semibold text-xs"
            >
              {error}
            </Alert>
          )}

          <Form className="space-y-6" onSubmit={handleStep3}>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                name="firstName" 
                label="First Name" 
                variant="flat"
                isRequired 
                labelPlacement="outside"
                placeholder="John"
                classNames={{
                  label: "text-xs font-bold text-default-600 ml-1",
                  inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                  input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
                }}
              />
              <Input 
                name="lastName" 
                label="Last Name" 
                variant="flat"
                isRequired 
                labelPlacement="outside"
                placeholder="Doe"
                classNames={{
                  label: "text-xs font-bold text-default-600 ml-1",
                  inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                  input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                name="username" 
                label="Username" 
                variant="flat"
                isRequired 
                labelPlacement="outside"
                placeholder="johndoe"
                classNames={{
                  label: "text-xs font-bold text-default-600 ml-1",
                  inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                  input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
                }}
              />
              <Input 
                name="phone" 
                label="Phone Number" 
                variant="flat"
                isRequired 
                labelPlacement="outside"
                placeholder="+1 (555) 000-0000"
                classNames={{
                  label: "text-xs font-bold text-default-600 ml-1",
                  inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                  input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Autocomplete
                label="Country"
                name="country"
                variant="flat"
                isRequired
                labelPlacement="outside"
                placeholder="Select Country"
                selectedKey={selectedCountry}
                onSelectionChange={(key) => {
                    setSelectedCountry(key as string);
                    setSelectedState("");
                }}
                classNames={{
                  listboxWrapper: "bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-xl",
                }}
                inputProps={{
                  classNames: {
                    label: "text-xs font-bold text-default-600 ml-1",
                    inputWrapper: "h-14 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors rounded-xl border-none",
                  }
                }}
              >
                {countries.map((country) => (
                  <AutocompleteItem key={country.isoCode}>
                    {country.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>

              <Autocomplete
                label="State / Province"
                name="state"
                variant="flat"
                isRequired
                labelPlacement="outside"
                placeholder="Select State"
                selectedKey={selectedState}
                onSelectionChange={(key) => setSelectedState(key as string)}
                isDisabled={!selectedCountry}
                classNames={{
                    listboxWrapper: "bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-xl",
                  }}
                inputProps={{
                  classNames: {
                    label: "text-xs font-bold text-default-600 ml-1",
                    inputWrapper: "h-14 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors rounded-xl border-none",
                  }
                }}
              >
                {states.map((state) => (
                  <AutocompleteItem key={state.isoCode}>
                    {state.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Autocomplete
                label="City"
                name="city"
                variant="flat"
                isRequired
                labelPlacement="outside"
                placeholder="Select City"
                isDisabled={!selectedState}
                classNames={{
                    listboxWrapper: "bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-xl",
                  }}
                inputProps={{
                  classNames: {
                    label: "text-xs font-bold text-default-600 ml-1",
                    inputWrapper: "h-14 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors rounded-xl border-none",
                  }
                }}
              >
                {cities.map((city) => (
                  <AutocompleteItem key={city.name}>
                    {city.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>

              <Input 
                name="address" 
                label="Physical Address" 
                variant="flat"
                isRequired 
                labelPlacement="outside"
                placeholder="123 Trading St."
                classNames={{
                  label: "text-xs font-bold text-default-600 ml-1",
                  inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                  input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
                }}
              />
            </div>

            <Input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              label="Password"
              variant="flat"
              isRequired
              labelPlacement="outside"
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              errorMessage={getPasswordError(password)}
              classNames={{
                label: "text-xs font-bold text-default-600 ml-1",
                inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
              }}
              endContent={
                <button 
                  type="button" 
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="text-neutral-400 hover:text-[#33525c] transition-colors p-1"
                >
                  {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />

            <Button 
              type="submit" 
              isLoading={loading} 
              className="w-full bg-[#33525c] text-white font-bold h-14 rounded-xl hover:scale-[1.01] transition-transform shadow-xl shadow-[#33525c]/20 mt-4"
            >
              Complete Registration
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
