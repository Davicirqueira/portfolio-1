import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { z } from 'zod'

// Supported image formats
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validation schema
const uploadSchema = z.object({
  filename: z.string().min(1),
  category: z.enum(['profile', 'project', 'general']).optional().default('general'),
  replaceExisting: z.boolean().optional().default(false)
});

// Helper function to generate unique filename
function generateUniqueFilename(originalName: string, category: string): string {
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-');
  
  return `${category}-${sanitizedName}-${timestamp}${extension}`;
}

// Helper function to validate image file
function validateImageFile(file: File): string | null {
  // Check file type
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return 'Formato não suportado. Use JPG, PNG ou WebP.';
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
  }

  return null;
}

// POST - Upload new image
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const replaceExisting = formData.get('replaceExisting') === 'true';
    const existingFilename = formData.get('existingFilename') as string;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Validate category
    const validatedData = uploadSchema.parse({
      filename: file.name,
      category,
      replaceExisting
    });

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Create category subdirectory
    const categoryDir = path.join(uploadsDir, validatedData.category);
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }

    // Determine filename
    let filename: string;
    if (replaceExisting && existingFilename) {
      // Keep the same filename for replacement
      filename = existingFilename;
    } else {
      // Generate new unique filename
      filename = generateUniqueFilename(file.name, validatedData.category);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to disk
    const filePath = path.join(categoryDir, filename);
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/${validatedData.category}/${filename}`;

    // Log the upload (in a real app, you might want to store this in database)
    console.log(`Image uploaded: ${publicUrl} by ${session.user?.email}`);

    return NextResponse.json({
      success: true,
      data: {
        filename,
        url: publicUrl,
        category: validatedData.category,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remove image
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const category = searchParams.get('category') || 'general';

    if (!filename) {
      return NextResponse.json({ error: 'Nome do arquivo é obrigatório' }, { status: 400 });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', category, filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    // Delete file
    const { unlink } = await import('fs/promises');
    await unlink(filePath);

    console.log(`Image deleted: ${filename} by ${session.user?.email}`);

    return NextResponse.json({
      success: true,
      message: 'Imagem removida com sucesso'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}