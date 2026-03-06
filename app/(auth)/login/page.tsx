import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-black font-sans">Welcome Back</h1>
                    <p className="text-gray-500 font-sans">Sign in to your account</p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-sans"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-sans"
                            placeholder="Enter password"
                        />
                    </div>

                    <button className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 transition-colors font-sans">
                        Sign In
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 font-sans">
                    Don't have an account? <Link href="/auth/signup" className="text-black font-semibold hover:underline">Sign up</Link>
                </p>
            </div>
            <div className="mt-8">
                <Link href="/" className="text-sm text-gray-400 hover:text-black transition-colors font-sans">← Back to Home</Link>
            </div>
        </div>
    );
}
