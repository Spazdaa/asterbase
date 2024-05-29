/** Generic utility functions used throughout the frontend. */

export async function blobToString(blob: Blob): Promise<string | undefined> {
  return await new Promise<string | undefined>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result?.toString());
    };
    reader.readAsDataURL(blob);
  });
}
