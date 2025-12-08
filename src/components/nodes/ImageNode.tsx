import { memo, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

interface ImageNodeData extends Record<string, unknown> {
    label: string;
    imageUrl?: string;
}

type ImageNodeProps = NodeProps<Node<ImageNodeData>>;

function ImageNodeComponent({ data, selected }: ImageNodeProps) {
    const [imageUrl, setImageUrl] = useState(data.imageUrl || "");

    const handleDoubleClick = () => {
        const newUrl = prompt("Enter image URL:", imageUrl);
        if (newUrl !== null) {
            setImageUrl(newUrl);
            data.imageUrl = newUrl;
        }
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className={`
        p-2 rounded-lg border shadow-md min-w-[100px] min-h-[100px]
        bg-card text-card-foreground border-border
        ${selected ? "ring-2 ring-primary" : ""}
        transition-all duration-200 cursor-pointer
      `}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-primary !border-primary-foreground !w-3 !h-3"
            />
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={data.label}
                    className="max-w-[200px] max-h-[150px] rounded object-cover"
                />
            ) : (
                <div className="flex items-center justify-center w-[100px] h-[80px] bg-muted rounded text-muted-foreground text-xs">
                    Double-click to add image
                </div>
            )}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-primary !border-primary-foreground !w-3 !h-3"
            />
        </div>
    );
}

export const ImageNode = memo(ImageNodeComponent);
