import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Sparkles, TrendingUp, ImageIcon, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ImageCropper } from "@/components/dashboard/ImageCropper";

interface SpecialImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface SeasonalSpecial {
  id: string;
  name: string;
  description: string | null;
  season: string;
  price: number | null;
  is_active: boolean;
  order_count: number;
  image_url: string | null;
  images?: SpecialImage[];
}

const seasons = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "holiday", label: "Holiday" },
  { value: "year_round", label: "Year Round" },
];

const SpecialsPage = () => {
  const { user } = useAuth();
  const [specials, setSpecials] = useState<SeasonalSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<SeasonalSpecial | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Multiple images state
  const [pendingImages, setPendingImages] = useState<{ file: File; preview: string; cropped?: Blob }[]>([]);
  const [existingImages, setExistingImages] = useState<SpecialImage[]>([]);
  
  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<{ src: string; index: number } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    season: "spring",
    price: "",
    is_active: true,
  });

  useEffect(() => {
    if (user) fetchSpecials();
  }, [user]);

  const fetchSpecials = async () => {
    const { data, error } = await supabase
      .from("seasonal_specials")
      .select("*")
      .order("order_count", { ascending: false });

    if (!error && data) {
      // Fetch images for each special
      const specialsWithImages = await Promise.all(
        data.map(async (special) => {
          const { data: images } = await supabase
            .from("seasonal_special_images")
            .select("*")
            .eq("special_id", special.id)
            .order("display_order", { ascending: true });
          return { ...special, images: images || [] };
        })
      );
      setSpecials(specialsWithImages);
    }
    setLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Images must be less than 5MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        const newIndex = pendingImages.length;
        setPendingImages((prev) => [...prev, { file, preview }]);
        // Open cropper for the new image
        setImageToCrop({ src: preview, index: newIndex });
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (imageToCrop !== null) {
      setPendingImages((prev) =>
        prev.map((img, idx) =>
          idx === imageToCrop.index
            ? { ...img, cropped: croppedBlob, preview: URL.createObjectURL(croppedBlob) }
            : img
        )
      );
    }
    setCropperOpen(false);
    setImageToCrop(null);
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    const { error } = await supabase
      .from("seasonal_special_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      toast.error("Failed to remove image");
    } else {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image removed");
    }
  };

  const uploadImages = async (specialId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < pendingImages.length; i++) {
      const { file, cropped } = pendingImages[i];
      const uploadFile = cropped || file;
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${specialId}-${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("seasonal-specials")
        .upload(fileName, uploadFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("seasonal-specials")
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImage(true);

    try {
      if (editingSpecial) {
        // Update special data
        const specialData = {
          user_id: user!.id,
          name: formData.name,
          description: formData.description || null,
          season: formData.season,
          price: formData.price ? parseFloat(formData.price) : null,
          is_active: formData.is_active,
        };

        const { error } = await supabase
          .from("seasonal_specials")
          .update(specialData)
          .eq("id", editingSpecial.id);

        if (error) {
          toast.error("Failed to update special");
          return;
        }

        // Upload new images if any
        if (pendingImages.length > 0) {
          const uploadedUrls = await uploadImages(editingSpecial.id);
          const startOrder = existingImages.length;

          for (let i = 0; i < uploadedUrls.length; i++) {
            await supabase.from("seasonal_special_images").insert({
              special_id: editingSpecial.id,
              image_url: uploadedUrls[i],
              display_order: startOrder + i,
            });
          }
        }

        toast.success("Special updated successfully");
      } else {
        // Create new special
        const specialData = {
          user_id: user!.id,
          name: formData.name,
          description: formData.description || null,
          season: formData.season,
          price: formData.price ? parseFloat(formData.price) : null,
          is_active: formData.is_active,
        };

        const { data: newSpecial, error } = await supabase
          .from("seasonal_specials")
          .insert(specialData)
          .select()
          .single();

        if (error || !newSpecial) {
          toast.error("Failed to create special");
          return;
        }

        // Upload images if any
        if (pendingImages.length > 0) {
          const uploadedUrls = await uploadImages(newSpecial.id);

          for (let i = 0; i < uploadedUrls.length; i++) {
            await supabase.from("seasonal_special_images").insert({
              special_id: newSpecial.id,
              image_url: uploadedUrls[i],
              display_order: i,
            });
          }
        }

        toast.success("Special created successfully");
      }

      closeDialog();
      fetchSpecials();
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = async (special: SeasonalSpecial) => {
    setEditingSpecial(special);
    setFormData({
      name: special.name,
      description: special.description || "",
      season: special.season,
      price: special.price?.toString() || "",
      is_active: special.is_active,
    });
    setExistingImages(special.images || []);
    setPendingImages([]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this special?")) return;

    const { error } = await supabase.from("seasonal_specials").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete special");
    } else {
      toast.success("Special deleted");
      fetchSpecials();
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("seasonal_specials")
      .update({ is_active: isActive })
      .eq("id", id);

    if (!error) {
      setSpecials(specials.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)));
    }
  };

  const incrementOrderCount = async (id: string) => {
    const special = specials.find((s) => s.id === id);
    if (!special) return;

    const { error } = await supabase
      .from("seasonal_specials")
      .update({ order_count: special.order_count + 1 })
      .eq("id", id);

    if (!error) {
      setSpecials(
        specials.map((s) => (s.id === id ? { ...s, order_count: s.order_count + 1 } : s))
      );
      toast.success("Order count updated!");
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSpecial(null);
    setPendingImages([]);
    setExistingImages([]);
    setFormData({
      name: "",
      description: "",
      season: "spring",
      price: "",
      is_active: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case "spring": return "bg-green-100 text-green-800";
      case "summer": return "bg-yellow-100 text-yellow-800";
      case "fall": return "bg-orange-100 text-orange-800";
      case "winter": return "bg-blue-100 text-blue-800";
      case "holiday": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDisplayImage = (special: SeasonalSpecial) => {
    if (special.images && special.images.length > 0) {
      return special.images[0].image_url;
    }
    return special.image_url;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Seasonal Specials</h1>
            <p className="text-muted-foreground mt-1">Track popularity of your seasonal offerings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Special
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingSpecial ? "Edit Special" : "Create Seasonal Special"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pumpkin Spice Cake"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your seasonal creation..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Season *</Label>
                    <Select
                      value={formData.season}
                      onValueChange={(v) => setFormData({ ...formData, season: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {seasons.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Multiple Photos Section */}
                <div className="space-y-2">
                  <Label>Photos (Multiple allowed)</Label>
                  <div className="space-y-3">
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border group">
                            <img
                              src={img.image_url}
                              alt="Special"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeExistingImage(img.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Pending Images */}
                    {pendingImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {pendingImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border group">
                            <img
                              src={img.preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  setImageToCrop({ src: img.preview, index: idx });
                                  setCropperOpen(true);
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removePendingImage(idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {img.cropped && (
                              <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">
                                Cropped
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <div
                      className="w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">Click to add photos</p>
                      <p className="text-xs text-muted-foreground">Max 5MB each</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Currently Available</Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" disabled={uploadingImage}>
                    {uploadingImage ? "Uploading..." : editingSpecial ? "Update Special" : "Create Special"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : specials.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-accent" />
              <p>No seasonal specials yet. Add your first seasonal offering!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {specials.map((special) => (
              <Card
                key={special.id}
                className={!special.is_active ? "opacity-60" : ""}
              >
                <CardContent className="p-0">
                  {getDisplayImage(special) && (
                    <div className="relative h-40 overflow-hidden rounded-t-lg">
                      <img
                        src={getDisplayImage(special)!}
                        alt={special.name}
                        className="w-full h-full object-cover"
                      />
                      {special.images && special.images.length > 1 && (
                        <Badge className="absolute bottom-2 right-2" variant="secondary">
                          +{special.images.length - 1} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{special.name}</h3>
                          <Badge className={getSeasonColor(special.season)}>
                            {seasons.find((s) => s.value === special.season)?.label}
                          </Badge>
                        </div>
                        {special.description && (
                          <p className="text-sm text-muted-foreground mb-3">{special.description}</p>
                        )}
                        <div className="flex items-center gap-4">
                          {special.price && (
                            <span className="font-semibold text-primary">
                              ${Number(special.price).toFixed(2)}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            {special.order_count} orders
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Switch
                          checked={special.is_active}
                          onCheckedChange={(checked) => toggleActive(special.id, checked)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementOrderCount(special.id)}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Order
                      </Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(special)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(special.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop.src}
          open={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            setImageToCrop(null);
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={16 / 9}
        />
      )}
    </DashboardLayout>
  );
};

export default SpecialsPage;
