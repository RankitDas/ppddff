import { NextRequest, NextResponse } from "next/server";
import { validateRequest, ValidationError, stripExtension } from "@/lib/validators";
import { createWorkDir, removeDir } from "@/lib/fileUtils";
import { runConversion } from "@/converter";
import { runCleanup } from "@/lib/cleanup";
import { mergePdfs } from "@/converter/pdf";
import { MAX_UPLOAD_BYTES } from "@/lib/validators";

export async function POST(request: NextRequest) {
  let workDir: string | null = null;
  try {
    // 1. Run cleanup sweeper in background (fire-and-forget)
    runCleanup().catch(() => {});

    // 2. Parse FormData
    const formData = await request.formData();
    const to = formData.get("to") as string | null;

    if (!to) {
      return NextResponse.json(
        { error: "Missing target format ('to')." },
        { status: 400 }
      );
    }

    // 3. Special fast-path for PDF Merge (supports multiple files)
    if (to === "merge") {
      const filesList = formData.getAll("files");
      const files = (filesList.length > 0 ? filesList : formData.getAll("file")) as File[];

      if (!files || files.length < 2) {
        return NextResponse.json(
          { error: "At least 2 PDF files are required for merging." },
          { status: 400 }
        );
      }

      const buffers: Buffer[] = [];
      for (const file of files) {
        if (file.size > MAX_UPLOAD_BYTES) {
          return NextResponse.json(
            { error: `File "${file.name}" exceeds the 50 MB limit.` },
            { status: 400 }
          );
        }
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext !== "pdf") {
          return NextResponse.json(
            { error: `File "${file.name}" is not a PDF. Only PDFs can be merged.` },
            { status: 400 }
          );
        }
        const arrayBuffer = await file.arrayBuffer();
        buffers.push(Buffer.from(arrayBuffer));
      }

      const mergedBuffer = await mergePdfs(buffers);
      const firstBase = stripExtension(files[0]!.name);
      const outFilename = `${firstBase}-merged.pdf`;

      return new Response(new Uint8Array(mergedBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(outFilename)}"`,
          "Access-Control-Expose-Headers": "Content-Disposition",
        },
      });
    }

    // 4. Standard single file conversion path
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "Missing file." },
        { status: 400 }
      );
    }

    // Validate request
    const validated = validateRequest({
      filename: file.name,
      size: file.size,
      mime: file.type,
      to,
    });

    // Create working directory
    workDir = await createWorkDir();

    // Read file data into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const data = Buffer.from(arrayBuffer);

    // Run conversion
    const result = await runConversion({
      from: validated.from,
      to: validated.to,
      data,
      safeName: validated.safeName,
      workDir,
    });

    // Determine output filename
    const baseName = stripExtension(file.name);
    const outExt = result.ext;
    const outFilename = `${baseName}.${outExt}`;

    // Return file
    return new Response(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.mime,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(outFilename)}"`,
        "Access-Control-Expose-Headers": "Content-Disposition",
      },
    });

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[Convert API Error]:", error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during conversion." },
      { status: 500 }
    );
  } finally {
    // Clean up workDir
    if (workDir) {
      removeDir(workDir).catch(() => {});
    }
  }
}
