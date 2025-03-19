import { readdir } from 'node:fs/promises';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { eTag, ifNoneMatch } from './etag.ts';
import createResponseHeaders from './header.ts';
import { parseYAMLFrontMatter } from './utils.ts';
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
  image: string;
  slug: string;
}

// read all the files in the current directory
const files = await readdir(`${Bun.cwd}/src`);
const blogCards: BlogCard[] = await Promise.all(files.map(async (file) => {
  const archive = Bun.file(`${Bun.cwd}/src/${file}`);
  const content = await archive.text();
  const metadata = parseYAMLFrontMatter(content)
  return {...metadata, slug: file.split('.')[0]};
}));

// Generate HTML for blog cards to be inserted in the main layout
function generateCardsHTML(cards: BlogCard[]): string {
  return cards
    .map((card) => `
      <article class="card">
        <div class="card__image" style="background-image: url('/public/img/${card.image}')">
          <div class="card__image-overlay"></div>
        </div>
        <div class="card__content">
          <h2 class="card__title">${card.title}</h2>
          <div class="card__meta">
            <span class="card__date">15 Mayo 2023</span>
            <span class="card__tag">${card.category}</span>
          </div>
          <a href="/blog/${card.slug}" class="card__link">Leer guía</a>
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

// Process blog post requests: load markdown file, parse it to HTML, and update the blog layout
const handleBlogRoute = async (req: Request): Promise<Response> => {
  const postTitle = req.params.title;
  const postFilePath = `${Bun.cwd}/src/${postTitle}.md`;
  const postMarkdownFile = Bun.file(postFilePath);
  const removeFrontMatter = (content: string): string =>
    content.startsWith('---')
      ? content.replace(/^---[\s\S]*?---\s*/, '')
      : content;
  const postMarkdownContent = removeFrontMatter(await postMarkdownFile.text());
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

const server = Bun.serve({
  routes: {
    '/': {
      GET: () => new Response(transformedMainLayout, createResponseHeaders({ ext: 'html' }))
    },
    '/blog/:title': {
      GET: (req: Request) => handleBlogRoute(req)
    }
  },
  port: process.env.PORT ?? 4322,
  fetch: async (req: Request) => {
    const { pathname } = new URL(req.url);
    const fileExtension = pathname.split('.').pop() || '';
    const publicFilePath = `${Bun.cwd}${pathname}`;
    const file = Bun.file(publicFilePath);

    if (!(await file.exists())) {
      return new Response('Archivo no encontrado', { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const computedETag = await eTag(uint8Array);
    const ifNone = req.headers.get("if-none-match");

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (imageExtensions.includes(fileExtension.toLowerCase())) {
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
    return new Response(file, headers);
  }
});
