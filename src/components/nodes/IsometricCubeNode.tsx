import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";

type IsometricCubeNodeData = {
    color?: "cyan" | "purple" | "emerald";
    delay?: number;
};
type IsometricCubeNodeProps = NodeProps<Node<IsometricCubeNodeData>>;

const colorMap = {
    cyan: {
        top: "bg-cyan-500/20 border-cyan-400",
        left: "bg-cyan-900/60 border-cyan-500",
        right: "bg-cyan-700/40 border-cyan-400",
        glow: "shadow-[0_0_30px_rgba(6,182,212,0.6)]"
    },
    purple: {
        top: "bg-purple-500/20 border-purple-400",
        left: "bg-purple-900/60 border-purple-500",
        right: "bg-purple-700/40 border-purple-400",
        glow: "shadow-[0_0_30px_rgba(168,85,247,0.6)]"
    },
    emerald: {
        top: "bg-emerald-500/20 border-emerald-400",
        left: "bg-emerald-900/60 border-emerald-500",
        right: "bg-emerald-700/40 border-emerald-400",
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.6)]"
    }
};

function IsometricCubeNodeComponent({ data, selected }: IsometricCubeNodeProps) {
    const colorStyle = colorMap[data.color || "cyan"];
    const delay = data.delay || 0;

    return (
        <div
            className={`relative w-[100px] h-[100px] group cursor-pointer animate-float transition-all duration-500 ease-out 
                ${selected ? 'scale-110 z-50 ' + colorStyle.glow : 'hover:scale-105 hover:z-40 hover:' + colorStyle.glow}`}
            style={{
                animationDelay: `${delay}ms`,
                // Applying the true isometric transform to the container
                transformStyle: "preserve-3d",
                transform: "rotateX(60deg) rotateZ(-45deg)"
            }}
        >
            {/* The cube itself (100x100 base) */}
            <div className={`absolute w-[100px] h-[100px] transition-colors duration-300 pointer-events-none`}
                style={{ transformStyle: "preserve-3d" }}>

                {/* Top face (X-Y plane) */}
                <div className={`absolute w-[100px] h-[100px] border border-opacity-50 backdrop-blur-sm ${colorStyle.top}`}
                    style={{ transform: "translateZ(50px)" }} />

                {/* Left face (Y-Z plane) */}
                <div className={`absolute w-[100px] h-[100px] border border-opacity-50 ${colorStyle.left}`}
                    style={{ transform: "rotateY(90deg) translateZ(-50px)" }} />

                {/* Right face (X-Z plane) */}
                <div className={`absolute w-[100px] h-[100px] border border-opacity-50 ${colorStyle.right}`}
                    style={{ transform: "rotateX(90deg) translateZ(-50px)" }} />

                {/* Bottom glow */}
                <div className={`absolute w-[100px] h-[100px] ${colorStyle.top} blur-xl opacity-30`}
                    style={{ transform: "translateZ(-20px)" }} />
            </div>
        </div>
    );
}

export const IsometricCubeNode = memo(IsometricCubeNodeComponent);
