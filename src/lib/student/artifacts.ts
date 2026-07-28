export function getArtifactMetadata(url: string) {
  const filename = new URL(url).pathname.split("/").pop();

  return {
    filename,
    name: filename?.replace(/^[0-9a-f-]{36}_/, ""),
    extension: filename?.split(".").pop()?.toLowerCase() ?? "FILE",
  };
}