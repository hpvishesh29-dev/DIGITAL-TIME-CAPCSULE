import PDFDocument from 'pdfkit';
import archiver from 'archiver';

export const generateMemoryPDFStream = (memories = [], res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Chrona_Digital_Time_Capsule_Export_${Date.now()}.pdf"`
  );

  doc.pipe(res);

  // Header
  doc
    .fillColor('#6366F1')
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('CHRONA – AI DIGITAL TIME CAPSULE', { align: 'center' });
  doc.moveDown(0.5);

  doc
    .fillColor('#64748B')
    .fontSize(12)
    .font('Helvetica')
    .text(`Export Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1.5);

  // Memory Entries
  memories.forEach((mem, index) => {
    doc
      .fillColor('#0F172A')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`${index + 1}. ${mem.title || 'Untitled Memory'}`);

    doc
      .fillColor('#06B6D4')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`[${mem.category || 'General'}] • Mood: ${mem.mood || 'Inspiring'} • Date: ${mem.date || 'N/A'}`);
    doc.moveDown(0.4);

    doc
      .fillColor('#334155')
      .fontSize(11)
      .font('Helvetica')
      .text(mem.description || 'No description provided.');
    doc.moveDown(0.5);

    if (mem.tags && mem.tags.length > 0) {
      doc
        .fillColor('#8B5CF6')
        .fontSize(9)
        .font('Helvetica-Oblique')
        .text(`Tags: ${mem.tags.join(', ')}`);
      doc.moveDown(0.5);
    }

    doc
      .strokeColor('#E2E8F0')
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown(1);
  });

  doc.end();
};

export const generateMemoryZipStream = (memories = [], res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Chrona_Vault_Backup_${Date.now()}.zip"`
  );

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(res);

  // 1. Full JSON Manifest
  archive.append(JSON.stringify(memories, null, 2), { name: 'memories_manifest.json' });

  // 2. Markdown File per memory
  memories.forEach((mem, i) => {
    const slug = (mem.title || `memory_${i + 1}`).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const mdContent = `# ${mem.title}\n\n**Category**: ${mem.category}\n**Mood**: ${mem.mood}\n**Date**: ${mem.date}\n**Tags**: ${mem.tags ? mem.tags.join(', ') : ''}\n\n---\n\n${mem.description}\n`;
    archive.append(mdContent, { name: `memories/${slug}.md` });
  });

  archive.finalize();
};

export const generateMemoryMarkdown = (memories = []) => {
  let md = `# Chrona Digital Time Capsule Export\n\nExported on: ${new Date().toLocaleString()}\nTotal Memories: ${memories.length}\n\n---\n\n`;

  memories.forEach((m, index) => {
    md += `## ${index + 1}. ${m.title}\n`;
    md += `- **Category**: ${m.category || 'General'}\n`;
    md += `- **Mood**: ${m.mood || 'Inspiring'}\n`;
    md += `- **Date**: ${m.date || 'N/A'}\n`;
    md += `- **Tags**: ${m.tags ? m.tags.join(', ') : 'None'}\n\n`;
    md += `${m.description || 'No description'}\n\n---\n\n`;
  });

  return md;
};
