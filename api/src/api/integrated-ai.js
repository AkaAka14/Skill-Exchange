import { Readable } from 'stream';

export const ContentBlockType = {
  Image: 'image',
};

export async function stream({ userId, systemPrompt, userMessage }) {
  return new Readable({
    read() {
      const data = {
        type: 'content',
        data: { content: '[]' },
      };
      this.push(`data: ${JSON.stringify(data)}\n\n`);
      this.push('data: [DONE]\n\n');
      this.push(null);
    },
  });
}

export async function uploadImagesToPocketBase({ images }) {
  return images.map((file, index) => {
    const name = encodeURIComponent(file.originalname || `image-${index}`);
    return `http://localhost:3001/uploads/${name}`;
  });
}
