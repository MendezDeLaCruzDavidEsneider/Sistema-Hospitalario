"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Stethoscope, UserRound,
  Users, ClipboardList, HeartPulse, Pill, FileText,
  FlaskConical, Shield, LogOut
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const NAVIGATION = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    section: "Administracion",
    items: [
      { href: "/hospitales", icon: Building2, label: "Hospitales" },
      { href: "/especialidades", icon: Stethoscope, label: "Especialidades" },
      { href: "/medicamentos", icon: Pill, label: "Medicamentos" },
    ],
  },
  {
    section: "Atencion Medica",
    items: [
      { href: "/medicos", icon: UserRound, label: "Medicos" },
      { href: "/pacientes", icon: Users, label: "Pacientes" },
      { href: "/visitas", icon: ClipboardList, label: "Visitas" },
      { href: "/tratamientos", icon: HeartPulse, label: "Tratamientos" },
    ],
  },
  {
    section: "Documentos",
    items: [
      { href: "/formulas", icon: FileText, label: "Formulas" },
      { href: "/examenes", icon: FlaskConical, label: "Examenes" },
      { href: "/incapacidades", icon: Shield, label: "Incapacidades" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href));

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-64 bg-green-800 text-white flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="p-5 border-b border-green-700">
        <h1 className="text-base font-bold leading-tight">
          Sistema Hospitalario
        </h1>
        <p className="text-xs text-green-300 mt-0.5">SENA CEET · ADSO</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAVIGATION.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wider px-3 mb-1">
              {section.section}
            </p>

            <div className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    text-sm font-medium transition-all duration-150
                    ${
                      isActive(href)
                        ? "bg-green-600 text-white shadow-sm"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }
                  `}
                >
                  <Icon size={16} strokeWidth={2} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white transition-colors hover:bg-green-700"
        >
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
