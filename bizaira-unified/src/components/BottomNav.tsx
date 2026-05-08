import { NavLink as RouterNavLink } from "react-router-dom";
import { Home, Wand2, User, HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const NAVY = "#011224";
const ACTIVE = "#0D2344";

const BottomNav = () => {
  const { t, lang } = useI18n();
  const isHe = lang === "he";

  const navItems = [
    { 
      to: "/", 
      icon: Home, 
      label: t("nav.home")
    },
    { 
      to: "/create", 
      icon: Wand2, 
      label: t("nav.create")
    },
    { 
      to: "/dashboard", 
      icon: User, 
      label: t("nav.dashboard")
    },
    { 
      to: "/support", 
      icon: HelpCircle, 
      label: t("nav.support")
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ backgroundColor: "#FBF4E8", borderColor: "rgba(13, 35, 68, 0.1)" }}
      dir={isHe ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200">
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    color: isActive ? ACTIVE : "#999999",
                    transition: "color 200ms ease-in-out",
                  }}
                />
                <span
                  className="text-[11px] font-medium leading-none"
                  style={{
                    color: isActive ? ACTIVE : "#999999",
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: "'Montserrat', sans-serif",
                    transition: "color 200ms ease-in-out, font-weight 200ms ease-in-out",
                  }}
                >
                  {item.label}
                </span>
              </div>
            )}
          </RouterNavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
