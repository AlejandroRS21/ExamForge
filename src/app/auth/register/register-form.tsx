"use client";

// OpenSloth — Register Form Client Component
// Creates account via credentials with optional anonymous session merge

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";


const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (name.length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Introduce un correo electrónico válido";
    }

    if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!passwordPattern.test(password)) {
      newErrors.password =
        "La contraseña debe incluir mayúsculas, minúsculas y un número";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Get anonymousSessionId cookie value
      const anonymousSessionId = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('anonymousSessionId='))
        ?.split('=')[1];

      // Register via API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, anonymousSessionId: anonymousSessionId || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Registration failed");
        return;
      }

      // Auto-sign-in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setServerError("Account created but sign-in failed. Please log in.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleOAuthSignIn(provider: string) {
    setIsLoading(true);
    signIn(provider, { callbackUrl: "/dashboard" });
  }

  return (
    <div className="space-y-4">
      {/* OAuth Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => handleOAuthSignIn("google")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50/50 px-4 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-100/60 shadow-[0_3px_0_0_#FDE68A] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar con Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn("github")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50/50 px-4 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-100/60 shadow-[0_3px_0_0_#FDE68A] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continuar con GitHub
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-amber-200/80" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-amber-800/70 font-medium">
            O regístrate con correo
          </span>
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="rounded-2xl bg-orange-50 border-2 border-orange-200 px-4 py-3 text-sm text-orange-800 font-medium">
          <p>{serverError}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-amber-950">
            Nombre completo
          </label>
          <input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border-2 border-amber-200 bg-amber-50/30 px-3.5 py-2 text-sm text-amber-950 placeholder:text-amber-700/40 focus:bg-white focus:outline-none focus:border-amber-400 transition-all"
            autoComplete="name"
          />
          {errors.name && (
            <p className="text-xs text-orange-600 font-medium">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-sm font-semibold text-amber-950">
            Correo electrónico
          </label>
          <input
            id="reg-email"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border-2 border-amber-200 bg-amber-50/30 px-3.5 py-2 text-sm text-amber-950 placeholder:text-amber-700/40 focus:bg-white focus:outline-none focus:border-amber-400 transition-all"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-orange-600 font-medium">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="text-sm font-semibold text-amber-950">
            Contraseña
          </label>
          <input
            id="reg-password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border-2 border-amber-200 bg-amber-50/30 px-3.5 py-2 text-sm text-amber-950 placeholder:text-amber-700/40 focus:bg-white focus:outline-none focus:border-amber-400 transition-all"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-xs text-orange-600 font-medium">{errors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-sm font-semibold text-amber-950">
            Confirmar contraseña
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-2xl border-2 border-amber-200 bg-amber-50/30 px-3.5 py-2 text-sm text-amber-950 placeholder:text-amber-700/40 focus:bg-white focus:outline-none focus:border-amber-400 transition-all"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-orange-600 font-medium">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-b from-[#FF7A45] to-primary px-4 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#C84B1B] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 mt-2"
        >
          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-amber-900/80 font-medium pt-2">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href="/auth/login"
          className="font-bold text-primary hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
