import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, type Node, NodeResizer, useReactFlow } from "@xyflow/react";
import { Input } from "@/components/ui/input";

interface ImageNodeData extends Record<string, unknown> {
    label: string;
    imageUrl?: string;
}

type ImageNodeProps = NodeProps<Node<ImageNodeData>>;

function ImageNodeComponent({ id, data, selected }: ImageNodeProps) {
    const { updateNodeData } = useReactFlow();
    const [imageUrl, setImageUrl] = useState(data.imageUrl || "");
    const [isEditing, setIsEditing] = useState(false);
    const [editUrl, setEditUrl] = useState(data.imageUrl || "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditUrl(imageUrl);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editUrl !== imageUrl) {
            setImageUrl(editUrl);
            updateNodeData(id, { imageUrl: editUrl });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleBlur();
        }
        if (e.key === "Escape") {
            setIsEditing(false);
            setEditUrl(imageUrl);
        }
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className={`
        p-2 bg-card text-card-foreground border-border
        ${selected ? "ring-2 ring-primary" : ""}
        h-full w-full flex items-center justify-center
        transition-all duration-200 cursor-pointer
        min-w-[100px] min-h-[80px]
      `}
        >
            <NodeResizer
                isVisible={selected}
                minWidth={50}
                minHeight={50}
                lineClassName="border-primary"
                handleClassName="h-3 w-3 bg-primary border-2 border-background rounded"
            />
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-primary !border-primary-foreground !w-3 !h-3"
            />
            
            {isEditing ? (
                <div className="w-full px-2">
                    <Input
                        ref={inputRef}
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste Image URL"
                        className="h-8 text-xs w-full"
                    />
                </div>
            ) : (
                imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={data.label}
                        className="w-full h-full object-cover rounded pointer-events-none"
                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted rounded text-muted-foreground text-xs pointer-events-none p-2 text-center">
                        Double-click to add image URL
                    </div>
                )
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
