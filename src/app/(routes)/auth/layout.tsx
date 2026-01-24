import Navbar from "@/components/NavBar";

export default function AuthLayout ({ children } : { children: React.ReactNode }) {
    return (
        <div>
            <Navbar/>
            <main>
                {children}
            </main>
        </div>
    )
}