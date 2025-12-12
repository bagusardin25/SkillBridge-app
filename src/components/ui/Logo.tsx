// SkillBridge Logo Component
// Matches the favicon design: dark background with violet bridge icon

export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
        >
            <rect width="100" height="100" rx="20" fill="#1a1a1a" />
            <path
                d="M30 70 L50 30 L70 70"
                stroke="#8B5CF6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <circle cx="50" cy="25" r="5" fill="#8B5CF6" />
        </svg>
    );
}

export function LogoWithText({ size = 32, className = "" }: { size?: number; className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Logo size={size} />
            <span className="text-xl font-bold">SkillBridge</span>
        </div>
    );
}
