import { APP_NAME } from "@/constants";

export function PageLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden">
            {/* Mesmerizing Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[150px] animate-bounce duration-[10s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-pink-100/30 rounded-full blur-[100px]" />
            </div>

            {/* Flying Sacred Geometry / Floating Particles (CSS only) */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-primary/20 animate-float"
                        style={{
                            width: `${Math.random() * 10 + 5}px`,
                            height: `${Math.random() * 10 + 5}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${Math.random() * 5 + 5}s`
                        }}
                    />
                ))}
            </div>

            <div className="flex flex-col items-center gap-8 relative">
                {/* Modern Brand Icon Animation */}
                <div className="relative h-24 w-24">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-secondary/20 border-b-secondary animate-spin-slow" />
                    <div className="absolute inset-4 rounded-full border-2 border-primary/10 border-l-primary animate-reverse-spin" />

                    {/* Glowing Center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-primary shadow-[0_0_20px_rgba(244,114,182,0.8)] animate-ping" />
                    </div>
                </div>

                <div className="text-center space-y-4">
                    {/* Staggered Brand Name Entrance */}
                    <h1 className="flex items-center justify-center gap-1 overflow-hidden">
                        {APP_NAME.split('').map((char, i) => (
                            <span
                                key={i}
                                className="font-serif text-5xl font-bold text-primary inline-block animate-in slide-in-from-bottom-full duration-700"
                                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                            >
                                {char}
                            </span>
                        ))}
                    </h1>

                    {/* Progress Simulation Text */}
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground animate-pulse">
                            Unwrapping Excellence
                        </p>

                        {/* Elegant Progress Bar */}
                        <div className="w-48 h-[2px] bg-gray-100 rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-1/2 animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    33% { transform: translateY(-20px) translateX(10px); }
                    66% { transform: translateY(10px) translateX(-10px); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes reverse-spin {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes shimmer {
                    from { left: -100%; }
                    to { left: 200%; }
                }
                .animate-float {
                    animation: float linear infinite;
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
                .animate-reverse-spin {
                    animation: reverse-spin 2s linear infinite;
                }
                .animate-shimmer {
                    animation: shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
}
