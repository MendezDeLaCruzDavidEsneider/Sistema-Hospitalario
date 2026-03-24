/**
 * @file src/components/layouts/DashHeader.tsx
 *
 * @description Header superior del dashboard.
 * Muestra el email del usuario autenticado.
 */

interface DashHeaderProps {
  userEmail?: string;
}

export function DashHeader({ userEmail }: DashHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold">
          {userEmail?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-gray-600">{userEmail}</span>
      </div>
    </header>
  );
}