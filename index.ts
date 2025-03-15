import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { eTag, ifNoneMatch } from './etag.ts';
import createResponseHeaders from './header.ts';
import mainLayoutHTML from './layouts/layout.html' with { type: 'text' };
import blogLayoutHTML from './layouts/layoutBlog.html' with { type: 'text' };

// Configure markdown parser with syntax highlighting for code blocks
const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

// Define structure for blog cards displayed on the homepage
interface BlogCard {
  title: string;
  category: string;
  link: string;
}

const blogCards: BlogCard[] = [
  { title: 'Instalación mínima de ArtixLinux', category: 'Instalación', link: 'artixlinuxInstallation', image: 'instalacion-minima.png' },
  { title: 'Instalación de DWL en Wayland', category: 'Instalación', link: 'dwlInstallation', image: 'instalacion-dwl.png' },
  { title: 'Instalación de PipeWire en ArtixLinux', category: 'Instalación', link: 'pipewireInstallation', image: 'instalacion-pipewire.png' },
  { title: 'Configuración de Artix Linux', category: 'Configuración', link: 'configuringArtixLinux', image: 'configuracion-artixlinux.png' },
  { title: 'Alacritty: Configuración para Desarrolladores', category: 'Configuración', link: 'alacrittyDeveloperSetup', image: 'configuracion-alacritty.png' },
];

// Generate HTML for blog cards to be inserted in the main layout
function generateCardsHTML(cards: BlogCard[]): string {
  return cards
    .map((card) => `
      <article class="card">
        <div class="card__image" style="background-image: url('${card.image}')">
          <div class="card__image-overlay"></div>
        </div>
        <div class="card__content">
          <h2 class="card__title">${card.title}</h2>
          <div class="card__meta">
            <span class="card__date">15 Mayo 2023</span>
            <span class="card__tag">${card.category}</span>
          </div>
          <a href="/blog/${card.link}" class="card__link">Leer guía</a>
        </div>
      </article>
    `)
    .join('');
}

const cardsHTMLContent = generateCardsHTML(blogCards);

// Insert generated blog cards into the main layout's "posts-grid" div using HTMLRewriter
const getTransformedMainLayout = (): string =>
  new HTMLRewriter().on('div.posts-grid', {
    element(element) {
      element.append(cardsHTMLContent, { html: true });
    },
  }).transform(mainLayoutHTML);

const transformedMainLayout = getTransformedMainLayout();

// Serve the home page with the transformed main layout
const handleHomeRoute = async (req: Request): Response => {
  const computedETag = await eTag(transformedMainLayout)
  const ifNone = req.headers.get("if-none-match");
  if (!ifNoneMatch(ifNone, computedETag)) {
    return new Response(null, createResponseHeaders({
      status: 304,
      customHeaders: {
        "Cache-Control": "must-revalidate"
      }
    }));
  }
  const headers = createResponseHeaders({
    ext: 'html',       // La extensión del archivo para determinar el Content-Type
    customHeaders: {   // Headers personalizados
      "etag": computedETag,
      "Cache-Control": "must-revalidate"
    }
  });
  return new Response(transformedMainLayout, headers);
};

// Process blog post requests: load markdown file, parse it to HTML, and update the blog layout
const handleBlogRoute = async (req: Request, title: string): Promise<Response> => {
  const postTitle = title;
  const postFilePath = `${Bun.cwd}/src//artixlinuxInstallation.md`;
  const postMarkdownFile = Bun.file(postFilePath);
  const postMarkdownContent = await postMarkdownFile.text();
  const postHtmlContent = marked.parse(postMarkdownContent);

  // Update the blog layout with the post title and content using HTMLRewriter
  let transformedLayout = new HTMLRewriter().on('title', {
    element(element) {
      element.setInnerContent(postTitle);
    },
  }).transform(blogLayoutHTML);
  transformedLayout = new HTMLRewriter().on('article', {
    element(element) {
      element.setInnerContent(postHtmlContent, { html: true });
    },
  }).transform(transformedLayout);
  
  const computedETag = await eTag(transformedLayout);
  const ifNone = req.headers.get("if-none-match");
  if (!ifNoneMatch(ifNone, computedETag)) {
    return new Response(null, createResponseHeaders({
      status: 304,
      customHeaders: {
        "Cache-Control": "must-revalidate"
      }
    }));
  }
  const headers = createResponseHeaders({
    ext: 'html',
    customHeaders: {
      "etag": computedETag,
      "Cache-Control": "must-revalidate"
    }
  });
  return new Response(transformedLayout, headers);
};

// Serve static files (images, CSS, JS) from the public directory
const handleStaticFiles = async (request: Request): Promise<Response> => {
  const requestedFile = request.url.split('/').pop() || '';
  const fileExtension = requestedFile.split('.').pop() || '';
  const publicFilePath = `${Bun.cwd}/public/${requestedFile}`;
  const file = Bun.file(publicFilePath);

  if (!(await file.exists())) {
    return new Response('Archivo no encontrado', { status: 404 });
  }
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (imageExtensions.includes(fileExtension.toLowerCase())) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const computedETag = await eTag(uint8Array);
    const ifNone = request.headers.get("if-none-match");
    if (!ifNoneMatch(ifNone, computedETag)) {
      return new Response(null, createResponseHeaders({
        status: 304
      }));
    }
    const headers = createResponseHeaders({
      ext: fileExtension,
      customHeaders: {
        "etag": computedETag,
        "Cache-Control": "max-age=31536000,immutable"
      }
    });
    return new Response(file, headers);
  }

  const fileContent = await file.text();
  const computedETag = await eTag(fileContent);
  const ifNone = request.headers.get("if-none-match");
  if (!ifNoneMatch(ifNone, computedETag)) {
    return new Response(null, createResponseHeaders({
      status: 304,
      "Cache-Control": "public,max-age=3600,must-revalidate"
    }));
  }
  const headers = createResponseHeaders({
    ext: fileExtension,
    customHeaders: {
      "etag": computedETag,
      "Cache-Control": "public,max-age=3600,must-revalidate"
    }
  });
  return new Response(fileContent, headers);
};

// Initialize the Bun server with routes for home, blog posts, and static files
const server = Bun.serve({
  hostname: "::",
  port: process.env.PORT ?? 4321,
  fetch: async (req: Request) => {
    const pathname = new URL(req.url).pathname;
    if (pathname === '/') {
      return handleHomeRoute(req);
    }
    const match = pathname.match(/^\/blog\/([^\/]+)\/?$/);
    if (match) {
      return handleBlogRoute(req, match[1]);
    }
    return handleStaticFiles(req)
  }
});
