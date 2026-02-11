
import mammoth from 'mammoth'

export async function parsePdf(file: File): Promise<string> {
    const pdfjsLib: any = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
        fullText += pageText + '\n\n'
    }
    return fullText
}

export async function parseWord(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const filename = (file.name || '').toLowerCase()
    if (filename.endsWith('.doc') && !filename.endsWith('.docx')) {
        throw new Error('UNSUPPORTED_DOC')
    }
    const result = await mammoth.extractRawText({ arrayBuffer })
    return (result.value || '').trim()
}

export async function parseJson(file: File): Promise<string> {
    const text = await file.text()
    try {
        // Validate JSON
        const obj = JSON.parse(text)
        return '```json\n' + JSON.stringify(obj, null, 2) + '\n```'
    } catch {
        return text
    }
}
