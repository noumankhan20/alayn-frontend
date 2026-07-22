import SignUp from "@/components/SignUp";
import GuestGuard from "@/components/auth/GuestGuard";

export default function SignUpPage() {
    return (
        <GuestGuard>
            <SignUp />
        </GuestGuard>
    );
}
