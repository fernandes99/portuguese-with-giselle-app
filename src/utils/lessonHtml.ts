// Mesma sintaxe do site (parseHtmlTooltips): \\termo==tradução\\
const TOOLTIP_REGEX = /\\\\(.*?)==(.*?)\\\\/g;

function parseTooltips(html: string) {
  return html.replace(
    TOOLTIP_REGEX,
    (_match, key: string, value: string) =>
      `<span class="tip" tabindex="0">${key}<span class="tip-text">${value}</span></span>`
  );
}

// Estilos equivalentes aos de .dato-structured-text no site
const STYLES = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: transparent; }
  body {
    font-family: 'Poppins', -apple-system, Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.625;
    color: #374151;
    -webkit-text-size-adjust: 100%;
    overflow-wrap: break-word;
  }
  h1, h2, h3, h4, h5, h6 { margin: 24px 0 16px; font-weight: 700; color: #111827; line-height: 1.3; }
  h1 { font-size: 30px; } h2 { font-size: 24px; } h3 { font-size: 20px; }
  h4 { font-size: 18px; } h5, h6 { font-size: 16px; }
  p { margin: 0 0 20px; min-height: 16px; }
  ul, ol { margin: 0 0 16px; padding-left: 28px; }
  li { margin-bottom: 8px; padding-left: 8px; line-height: 1.75; }
  a { color: #00a63e; }
  img, video, iframe { max-width: 100%; height: auto; border-radius: 8px; }
  table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; margin-bottom: 16px; }
  th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
  blockquote { margin: 0 0 20px; padding: 14px 16px; border-left: 4px solid #00a63e; border-radius: 12px; background: #f0fdf4; color: #111827; font-weight: 600; }
  blockquote p:last-child { margin-bottom: 0; }
  #content > :first-child { margin-top: 0; }
  #content > :last-child { margin-bottom: 0; }
  .tip { position: relative; display: inline-block; color: #0e7490; text-decoration: underline; }
  .tip-text {
    display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
    z-index: 10; width: max-content; max-width: 160px; padding: 4px 8px; border-radius: 6px;
    background: #111827; color: #fff; font-size: 12px; line-height: 1.4; text-align: center;
    text-decoration: none;
  }
  .tip.open .tip-text { display: block; }
`;

// Informa a altura do conteúdo ao app e abre/fecha os tooltips no toque
const SCRIPT = `
  (function () {
    var content = document.getElementById('content');
    function postHeight() {
      window.ReactNativeWebView.postMessage(String(Math.ceil(content.getBoundingClientRect().height)));
    }
    if (window.ResizeObserver) { new ResizeObserver(postHeight).observe(content); }
    window.addEventListener('load', postHeight);
    document.addEventListener('click', function (event) {
      var tip = event.target.closest ? event.target.closest('.tip') : null;
      document.querySelectorAll('.tip.open').forEach(function (el) {
        if (el !== tip) { el.classList.remove('open'); }
      });
      if (tip) { tip.classList.toggle('open'); }
    });
    postHeight();
  })();
`;

export function buildLessonHtml(content: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>${STYLES}</style>
  </head>
  <body>
    <div id="content">${parseTooltips(content)}</div>
    <script>${SCRIPT}</script>
  </body>
</html>`;
}
