# holiday-jp

対象日が日本の祝日化どうかを判定できるライブラリ

npm install or update 時、postinstall, postupdate にて祝日csvをダウンロード
そのcsvを元にして祝日判定を行っています。



## 開発

### jest

```bash
npm run test
```

<br>

### TypeScript コンパイル

src/csv.js を作成します

```bash
npm run tsc
```

### 静的解析

```bash
npm run static_analysis
```

### webpack

dist/holiday-jp.min.js を作成

```bash
npm run build
```
