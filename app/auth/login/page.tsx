import { LoginForm } from "@/components/login-form"
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className=" flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex size-10 items-center justify-center">
                        <Image src={`/icon1.png`} alt={`DeeperWeave Logo`} height={40} width={40} className={`rounded-md`} />
                    </div>
                    DeeperWeave
                </a>
                <LoginForm />
            </div>
        </div>
    )
}
