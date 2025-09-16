import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "../../../../utils/config";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files = data.getAll("files") as File[];
    const collectionName = data.get("collectionName") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const group = await pinata.groups.public.create({
      name: collectionName || "untitled-collection",
    });

    const uploaded = [];
    for (const file of files) {
      const upload = await pinata.upload.public.file(file).group(group.id);
      uploaded.push(upload);
    }

    return NextResponse.json({ group, files: uploaded }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
