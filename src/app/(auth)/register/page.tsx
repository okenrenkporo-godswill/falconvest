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
import { FalconLogo } from "@/components/ui/logo-loader";


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
    setLoading(true);
    setError("");

    try {
      const result = await sendOtpAction(formData);

      if (result?.error) {
        setError(result.error);
        addToast({ title: "Error", description: result.error, color: "danger" });
      } else {
        setEmail(emailValue);
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
              <FalconLogo className="w-12 h-12" />
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
                placeholder="Enter your email address"
                classNames={{
                  label: "text-xs font-bold text-default-600 ml-1",
                  inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                  input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
                }}
              />

              <Button 
                type="submit" 
                isLoading={loading} 
                disabled={loading}
                className="w-full bg-[#33525c] text-white font-bold h-14 rounded-xl hover:scale-[1.01] transition-transform shadow-xl shadow-[#33525c]/20 mt-4"
              >
                {loading ? "Sending Code..." : "Continue"}
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
              <FalconLogo className="w-12 h-12" />
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
              className="bg-[#33525c]/10 text-[#33525c] border-none font-semibold text-xs animate-fade-in"
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
                    placeholder="•"
                    classNames={{
                      segment: "w-12 h-14 text-2xl font-black bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus-within:border-[#33525c] focus-within:ring-2 focus-within:ring-[#33525c]/20 transition-all",
                      input: "font-black text-center text-neutral-800 dark:text-neutral-200"
                    }}
                  />
                )}
              </div>

              <Button 
                type="submit" 
                isLoading={loading} 
                disabled={loading}
                className="w-full bg-[#33525c] text-white font-bold h-14 rounded-xl hover:scale-[1.01] transition-transform shadow-xl shadow-[#33525c]/20 mt-4"
              >
                {loading ? "Verifying Code..." : "Verify Code"}
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
            <FalconLogo className="w-12 h-12" />
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
                placeholder="Enter your first name"
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
                placeholder="Enter your last name"
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
                placeholder="Choose a username"
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
                placeholder="Enter your phone number"
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
                    listboxWrapper: "bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-xl",
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
                placeholder="Enter your physical address"
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
              placeholder="Create a strong password"
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
              disabled={loading}
              className="w-full bg-[#33525c] text-white font-bold h-14 rounded-xl hover:scale-[1.01] transition-transform shadow-xl shadow-[#33525c]/20 mt-4"
            >
              {loading ? "Completing Registration..." : "Complete Registration"}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}

