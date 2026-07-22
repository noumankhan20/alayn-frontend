import LoginComponent from "@/components/LoginComponent";
import GuestGuard from "@/components/auth/GuestGuard";

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginComponent />
    </GuestGuard>
  );
}
