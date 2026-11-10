function Logo({ size = 32, withText = false, className = "" }) {
    return (
        <span className={`g3logo ${className}`}>
            <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="G3-GPT logo">
                <rect width="64" height="64" rx="16" fill="#ececec" />
                <text x="32" y="43" textAnchor="middle" fontFamily="Inter,'Segoe UI',Helvetica,Arial,sans-serif"
                    fontSize="30" fontWeight="800" letterSpacing="-1.5" fill="#171717">G3</text>
            </svg>
            {withText && <span className="g3logo-text">G3-GPT</span>}
        </span>
    );
}

export default Logo;
