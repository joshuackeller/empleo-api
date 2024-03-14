import { FileType } from "@prisma/client";

function GetFileType(dataUrl: string): FileType {
  const mime = dataUrl.split(",")[0].match(/:(.*?);/)?.[1];

  const fileTypeMap: Record<string, FileType> = {
    "application/msword": FileType.doc,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      FileType.docx,
    "application/pdf": FileType.pdf,
    "image/png": FileType.png,
    "image/jpeg": FileType.jpeg,
    "application/vnd.apple.pages": FileType.pages,
    unknown: FileType.unknown,
  };

  if (!mime) return FileType.unknown;

  return fileTypeMap[mime] || FileType.unknown;
}

export default GetFileType;
