import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export async function POST(request) {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!folderId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { error: "Google Drive configuration is missing in environment variables" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Authenticate with Google Drive
    // Ensure we parse the private key correctly (replace escaped \n with actual newlines)
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT(
      clientEmail,
      null,
      formattedPrivateKey,
      ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]
    );

    const drive = google.drive({ version: "v3", auth });

    // Convert NextJS File object to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a readable stream from the buffer
    const mediaStream = new Readable();
    mediaStream.push(buffer);
    mediaStream.push(null);

    // Upload file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: mediaStream,
      },
      fields: "id, webContentLink, webViewLink",
    });

    const fileId = response.data.id;

    // Set file permission so anyone with the link can view it (required for downloading/proxying)
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    } catch (permError) {
      console.warn("[upload-to-drive] Warning: Could not set public permission on file", fileId, permError);
    }

    // Return the file ID and direct links
    return NextResponse.json({
      success: true,
      fileId: fileId,
      url: `/api/drive-image?id=${fileId}`, // Return our proxy URL directly
      webContentLink: response.data.webContentLink,
      webViewLink: response.data.webViewLink,
    });
  } catch (err) {
    console.error("[upload-to-drive] Error uploading to drive:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
