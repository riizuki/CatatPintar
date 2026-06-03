import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to parse PPTX XML slides using pure JS adm-zip
function parsePptxText(fileBuffer) {
  try {
    const zip = new AdmZip(fileBuffer);
    const zipEntries = zip.getEntries();
    
    // Sort slide xml files numerically (so slide 2 comes after slide 1 and before slide 10)
    const slideEntries = zipEntries
      .filter(entry => entry.entryName.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/\d+/)[0]);
        const numB = parseInt(b.entryName.match(/\d+/)[0]);
        return numA - numB;
      });
      
    let fullText = '';
    
    slideEntries.forEach((entry, idx) => {
      const xmlText = entry.getData().toString('utf8');
      
      // Match all text inside <a:t>...</a:t> tags
      const textMatches = xmlText.match(/<a:t>([\s\S]*?)<\/a:t>/g);
      if (textMatches) {
        const slideText = textMatches
          .map(match => match.replace(/<\/?a:t>/g, ''))
          .map(text => text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
          )
          .join(' ');
          
        fullText += `--- Slide ${idx + 1} ---\n${slideText}\n\n`;
      }
    });
    
    return fullText;
  } catch (error) {
    console.error('Error parsing PPTX:', error);
    throw new Error('Failed to parse PPTX file structure');
  }
}

// GET /api/materials - Get all uploaded materials (Notes with filePath)
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const materials = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        filePath: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials history:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/materials - Upload, parse and generate note from material
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const languageHeader = formData.get('language') || 'id';

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    const extension = path.extname(filename).toLowerCase();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Text Extraction
    let extractedText = '';
    if (extension === '.pdf') {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(fileBuffer);
      extractedText = data.text;
    } else if (extension === '.pptx' || extension === '.ppt') {
      extractedText = parsePptxText(fileBuffer);
    } else {
      return NextResponse.json({ message: 'Unsupported file type. Use PDF or PPTX.' }, { status: 400 });
    }

    if (!extractedText || extractedText.trim() === '') {
      return NextResponse.json({ message: 'Could not extract text from this file.' }, { status: 400 });
    }

    // 2. Save physical file locally
    const userId = session.user.id;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materials', String(userId));
    await mkdir(uploadDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${filename}`;
    const physicalPath = path.join(uploadDir, uniqueFilename);
    await writeFile(physicalPath, fileBuffer);
    
    const relativePath = `/uploads/materials/${userId}/${uniqueFilename}`;
    const fileType = extension.replace('.', '');

    // 3. AI structuring notes using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    
    const isEn = languageHeader === 'en';
    const systemLanguageText = isEn ? 'English' : 'Bahasa Indonesia';

    const prompt = `
      You are an expert student assistant.
      A user has uploaded a lecture material file named "${filename}".
      Below is the raw extracted text of the material:
      
      ---
      ${extractedText}
      ---
      
      Please read, understand, clean up and structure the raw content into a high-quality, comprehensive, and beautiful student note summary in HTML.
      Follow these guidelines:
      1. Output MUST be in raw, clean HTML. Use standard tags like <h2>, <h3>, paragraphs <p>, structured lists <ul>, <ol>, <li>, and important accents <strong> or <em>. Do NOT use <html>, <head>, or <body> tags.
      2. Group content logically. Summarize key concepts thoroughly, ensuring no critical educational elements are omitted.
      3. The response MUST be written in ${systemLanguageText}.
      4. Do NOT wrap the HTML output inside markdown code blocks like \`\`\`html or similar. Return ONLY the HTML code directly.
    `;

    const result = await model.generateContent(prompt);
    let formattedHtml = result.response.text().trim();

    // Clean up markdown wrapper if any
    if (formattedHtml.startsWith('```html')) {
      formattedHtml = formattedHtml.replace(/^```html/, '').replace(/```$/, '').trim();
    } else if (formattedHtml.startsWith('```')) {
      formattedHtml = formattedHtml.replace(/^```/, '').replace(/```$/, '').trim();
    }

    // 4. Manage auto-created Folder
    const folderName = isEn ? 'Lecture Materials' : 'Materi Kuliah';
    let folder = await prisma.folder.findFirst({
      where: {
        userId,
        name: folderName
      }
    });

    if (!folder) {
      folder = await prisma.folder.create({
        data: {
          userId,
          name: folderName
        }
      });
    }

    // 5. Create generated Note
    const newNote = await prisma.note.create({
      data: {
        userId,
        folderId: folder.id,
        title: filename,
        content: formattedHtml,
        filePath: relativePath,
        fileType: fileType
      }
    });

    return NextResponse.json({
      noteId: newNote.id,
      title: newNote.title
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading/processing material:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
