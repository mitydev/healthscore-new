import cheerio from 'cheerio';

interface PostData {
  title: string | null;
  summary: string | null;
  categories: string | null;
  date: string | null;
  link: string | null;
}

function extractPostData(post: cheerio.Root): PostData | null {
  const titleElement = post('a[rel="bookmark"]');
  const summaryElement = post('div.entry-excerpt');
  const categoriesElement = post('li.meta-categories');
  const timeElement = post('time.entry-date.published');

  const title = titleElement.text().trim() || null;
  const summary = summaryElement.text().trim() || null;
  const link = titleElement.attr('href') || null;
  const datetimeValue = timeElement.attr('content') || null;

  let categories: string | null = null;
  if (categoriesElement.length > 0) {
    const anchors = categoriesElement.find('a');
    categories = anchors
      .map((_, anchor) => cheerio(anchor).text().trim())
      .get()
      .join(', ') || null;
  }

  if (title && link) {
    return {
      title,
      summary,
      categories,
      date: datetimeValue,
      link,
    };
  }

  return null;
}

export default extractPostData;
