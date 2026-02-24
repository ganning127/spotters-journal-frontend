import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Photo } from "@/types";
import api from "@/api/axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { RotateCw, RotateCcw } from "lucide-react";

interface RotatePhotoModalProps {
    photo: Photo;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function RotatePhotoModal({ photo, isOpen, onClose, onUpdate }: RotatePhotoModalProps) {
    const [saving, setSaving] = useState(false);
    const [angle, setAngle] = useState(0);

    const handleRotateRight = () => {
        setAngle((prev) => (prev + 90) % 360);
    };

    const handleRotateLeft = () => {
        setAngle((prev) => (prev - 90) % 360);
    };

    const handleSave = async () => {
        // If it's a negative angle that circles back to 0, like -360
        if (angle % 360 === 0) {
            onClose();
            return;
        }

        setSaving(true);
        let normalizedAngle = angle % 360;
        if (normalizedAngle <= -270) normalizedAngle += 360; // Normalize

        try {
            await api.post(`/photos/${photo.id}/rotate`, { angle: normalizedAngle });
            toast.success("Photo rotated successfully");
            onUpdate();
            onClose();
            setAngle(0); // Reset after save
        } catch (error: any) {
            console.error("Failed to rotate photo", error);
            toast.error(error.response?.data?.error || "Failed to rotate photo");
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setAngle(0);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Rotate Photo</DialogTitle>
                    <DialogDescription>
                        Rotate the photo in 90-degree increments.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-muted rounded-md overflow-hidden p-4">
                        <img
                            src={photo.image_url}
                            alt="Photo to rotate"
                            className="max-w-full max-h-[40vh] object-contain transition-transform duration-300"
                            style={{ transform: `rotate(${angle}deg)` }}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={handleRotateLeft} disabled={saving}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Left
                        </Button>
                        <Button variant="outline" onClick={handleRotateRight} disabled={saving}>
                            <RotateCw className="mr-2 h-4 w-4" /> Right
                        </Button>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || angle % 360 === 0}>
                        {saving && <Spinner className="mr-2 h-4 w-4" />}
                        Save Rotation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
