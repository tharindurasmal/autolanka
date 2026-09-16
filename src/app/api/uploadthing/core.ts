import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/session";

const f = createUploadthing();

export const ourFileRouter = {
  listingImages: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    // Runs on YOUR server BEFORE the upload is allowed.
    .middleware(async () => {
      const session = await getSession();
      if (!session?.user) {
        throw new UploadThingError("You must be signed in to upload images.");
      }
      // Whatever we return here is passed to onUploadComplete.
      return { userId: session.user.id };
    })
    // Runs on YOUR server AFTER the file lands in storage.
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Uploaded by", metadata.userId, "→", file.ufsUrl);

      // Whatever we return here is sent back to the browser.
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;