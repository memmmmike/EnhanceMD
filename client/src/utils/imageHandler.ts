// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File ${file.name} is too large. Max size is 5MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Compress image if needed
export const compressImage = async (file: File, maxWidth: number = 800): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions - more aggressive resizing
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Also limit height to prevent very tall images
        const maxHeight = 1000;
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Determine quality based on file type and size
        let quality = 0.7; // Default 70% quality
        let outputType = file.type;
        
        // Convert PNG to JPEG for better compression (except if transparent)
        if (file.type === 'image/png' && !hasTransparency(ctx, width, height)) {
          outputType = 'image/jpeg';
          quality = 0.75;
        }
        
        // For JPEG, use lower quality
        if (outputType === 'image/jpeg') {
          quality = 0.65;
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // If compressed image is still too large, reduce quality further
              if (blob.size > 500 * 1024 && quality > 0.4) {
                canvas.toBlob(
                  (blob2) => {
                    if (blob2) {
                      resolve(new File([blob2], file.name, { type: outputType }));
                    } else {
                      resolve(new File([blob], file.name, { type: outputType }));
                    }
                  },
                  outputType,
                  quality - 0.2
                );
              } else {
                resolve(new File([blob], file.name, { type: outputType }));
              }
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          outputType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
};

// Helper function to check if image has transparency
function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Check every 10th pixel for transparency (for performance)
  for (let i = 3; i < data.length; i += 40) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
}

export const processMarkdownImages = async (markdown: string, imageMap: Map<string, string>): Promise<string> => {
  // Replace local image paths with base64 data
  let processedMarkdown = markdown;
  
  // Match standard markdown image syntax: ![alt text](path)
  const standardImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const standardMatches = [...markdown.matchAll(standardImageRegex)];
  
  for (const match of standardMatches) {
    const [fullMatch, altText, imagePath] = match;
    const base64Data = imageMap.get(imagePath);
    
    if (base64Data) {
      const newImageTag = `![${altText}](${base64Data})`;
      processedMarkdown = processedMarkdown.replace(fullMatch, newImageTag);
    }
  }
  
  // Match Obsidian-style image syntax: ![[image.png]] or ![[image.png|width]]
  const obsidianImageRegex = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const obsidianMatches = [...processedMarkdown.matchAll(obsidianImageRegex)];
  
  for (const match of obsidianMatches) {
    const [fullMatch, imagePath] = match;
    const base64Data = imageMap.get(imagePath);
    
    if (base64Data) {
      // Convert to standard markdown syntax with base64
      const newImageTag = `![${imagePath}](${base64Data})`;
      processedMarkdown = processedMarkdown.replace(fullMatch, newImageTag);
      console.log(`Replaced ${fullMatch} with base64 image`);
    } else {
      console.log(`No base64 data found for ${imagePath}`);
    }
  }
  
  return processedMarkdown;
};

export const extractImagePaths = (markdown: string): string[] => {
  const paths: string[] = [];
  
  // Extract standard markdown images: ![alt](path)
  const standardImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = standardImageRegex.exec(markdown)) !== null) {
    const imagePath = match[2];
    // Only include local paths (not URLs)
    if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://') && !imagePath.startsWith('data:')) {
      paths.push(imagePath);
    }
  }
  
  // Extract Obsidian-style images: ![[path]] or ![[path|width]]
  const obsidianImageRegex = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  
  while ((match = obsidianImageRegex.exec(markdown)) !== null) {
    const imagePath = match[1];
    paths.push(imagePath);
  }
  
  return [...new Set(paths)]; // Remove duplicates
};

// Generate possible path variations for a filename
export const generatePathVariations = (filename: string): string[] => {
  const variations = [
    filename,
    `./${filename}`,
    `images/${filename}`,
    `./images/${filename}`,
    `assets/${filename}`,
    `./assets/${filename}`,
    `img/${filename}`,
    `./img/${filename}`,
    `pics/${filename}`,
    `./pics/${filename}`,
    `media/${filename}`,
    `./media/${filename}`
  ];
  
  // Also handle without extension for matching
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const ext = filename.match(/\.[^/.]+$/)?.[0] || '';
  
  if (ext) {
    variations.push(
      `${nameWithoutExt}${ext.toLowerCase()}`,
      `${nameWithoutExt}${ext.toUpperCase()}`
    );
  }
  
  return variations;
};

// Check which images from markdown are matched/unmatched
export const getImageMatchStatus = (markdown: string, imageMap: Map<string, string>) => {
  const requiredPaths = extractImagePaths(markdown);
  const matched: string[] = [];
  const unmatched: string[] = [];
  
  requiredPaths.forEach(path => {
    if (imageMap.has(path)) {
      matched.push(path);
    } else {
      unmatched.push(path);
    }
  });
  
  return { matched, unmatched, total: requiredPaths.length };
};