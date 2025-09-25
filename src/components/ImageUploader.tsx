// components/FileUploader.tsx
import { useState } from "react";
import { UploadCloud } from "lucide-react";
import api from "@/lib/api";

type Props = {
  label?: string;
  onUploadSuccess: (id: number) => void; 
    multiple?: boolean;
  accept?: string; // عشان نحدد نوع الملفات (صور / PDF / Docs ...)
  preview?: boolean;
};

export default function FileUploader({
  label = "Upload File",
  onUploadSuccess,
  multiple = true,
  accept = "image/*",
  preview = true,
}: Props) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const filesToUpload = multiple ? files : [files[0]];

    setFileNames(filesToUpload.map((file) => file.name));
    setLoading(true);

    if (preview && accept.includes("image")) {
      const newPreviewUrls: string[] = [];
      filesToUpload.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviewUrls[index] = e.target?.result as string;
          setPreviewUrls([...newPreviewUrls]);
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const data = res.data;
        if (data?.data?.id) {
          onUploadSuccess(data.data.id);
        } else {
          alert("❌ فشل رفع الملف");
        }
      }
    } catch (error) {
      console.error(error);
      alert("❌ خطأ أثناء الرفع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

     <div 
  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50"
  onClick={() => document.getElementById("file-upload")?.click()}
>
  <UploadCloud className="text-gray-500 mb-2" size={28} />
  <p className="text-gray-600 text-sm">Click to upload or drag & drop</p>
  <input
    type="file"
    accept={accept}
    onChange={handleFileChange}
    className="hidden"
    id="file-upload"
    multiple={multiple}
  />
</div>


      {/* معاينة الصور */}
      {preview && previewUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {previewUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {loading && <p className="text-blue-500 text-sm mt-1">⏳ جاري الرفع...</p>}

      {fileNames.length > 0 && !loading && (
        <ul className="mt-2 space-y-1">
          {fileNames.map((name, index) => (
            <li key={index} className="text-green-600 text-sm">
              ✓ {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
