import * as WebBrowser from 'expo-web-browser';
import { useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';

import { buildLessonHtml } from '@/utils/lessonHtml';

// Renderiza o HTML da aula em um WebView que cresce até a altura do conteúdo,
// para rolar junto com o resto da tela.
export function HtmlContent({ html }: { html: string }) {
  const [height, setHeight] = useState(120);
  const source = useMemo(() => ({ html: buildLessonHtml(html) }), [html]);

  return (
    <WebView
      originWhitelist={['*']}
      source={source}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      style={{ height, backgroundColor: 'transparent' }}
      onMessage={(event) => {
        const next = Number(event.nativeEvent.data);
        if (next > 0) {
          setHeight(next);
        }
      }}
      onShouldStartLoadWithRequest={(request) => {
        // Links do conteúdo abrem no navegador; o resto (o próprio HTML e
        // iframes embutidos) carrega aqui.
        if (request.isTopFrame === false || !/^https?:/.test(request.url)) {
          return true;
        }

        WebBrowser.openBrowserAsync(request.url);
        return false;
      }}
    />
  );
}
