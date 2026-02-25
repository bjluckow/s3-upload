import JSZip from "jszip";

export async function zipFolder(files: File[]): Promise<File> {
    const zip = new JSZip();
    const folderName = files[0].webkitRelativePath.split("/")[0];

    for (const file of files) {
        const path = file.webkitRelativePath || file.name;
        zip.file(path, await file.arrayBuffer());
    }

    const blob = await zip.generateAsync({ type: "blob" });
    return new File([blob], `${folderName}.zip`, { type: "application/zip" });
}
