import React from 'react';

export const GridVisualizer: React.FC = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden min-h-[300px] bg-black/40">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 214, 203, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 214, 203, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    backgroundPosition: 'center'
                }}>
            </div>

            {/* Central Hub Node */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary shadow-[0_0_30px_rgba(0,214,203,0.3)] flex items-center justify-center animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-primary shadow-neon"></div>
                </div>
                <div className="absolute -bottom-8 font-mono text-xs text-primary/80 tracking-widest">MAIN NODE</div>
            </div>

            {/* Connected Nodes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <div key={i} className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: `rotate(${deg}deg)` }}>
                    <div className="absolute top-[20%] w-[1px] h-[30%] bg-gradient-to-t from-primary/50 to-transparent"></div>
                    <div className="absolute top-[20%] w-3 h-3 rounded-full bg-white/20 border border-primary/50 transform -rotate-[${deg}deg]"></div>
                </div>
            ))}

            {/* Scanning Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[20%] animate-scan" style={{ top: '-20%' }}></div>

            {/* HUD Elements */}
            <div className="absolute bottom-4 left-4 font-mono text-xs text-primary/60">
                GRID: ACTIVE<br />
                LOAD: 450 MW<br />
                FREQ: 60.0 HZ
            </div>
        </div>
    );
};
